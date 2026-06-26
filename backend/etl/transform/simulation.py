"""Generate per-race simulation bundles from PostgreSQL telemetry.

Each bundle is a static JSON file consumed by the frontend race simulation
overlay. Coordinates are normalized to [0, 1] so the frontend can scale them
into any circuit map container while preserving the track shape.

Includes per-frame lap numbers from the laps table and tyre stints fetched
from the OpenF1 API.
"""

import json
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pandas as pd
import requests
from sqlalchemy import text

from etl.config import config
from etl.db import get_sync_db

SIMULATION_DIR = config.staging_dir / "simulation"
FRAME_INTERVAL_SECONDS = 1.0

# ── Tyre compound colour palette ────────────────────────────────────────
TYRE_COLORS = {
    "SOFT": "#e10600",
    "MEDIUM": "#f1c40f",
    "HARD": "#ffffff",
    "INTERMEDIATE": "#27ae60",
    "WET": "#3498db",
}


def _get_race_sessions(db) -> list[dict]:
    rows = db.execute(
        text(
            """
            SELECT s.session_key, s.circuit_key, s.session_name, s.date_start, s.date_end
            FROM sessions s
            WHERE s.session_type ILIKE 'race' AND s.session_name ILIKE 'race'
            ORDER BY s.date_start
            """
        )
    ).mappings().all()
    return [dict(r) for r in rows]


def _get_drivers(db, session_key: int) -> dict[int, dict]:
    rows = db.execute(
        text(
            """
            SELECT ds.driver_number, d.full_name, ds.team_name
            FROM driver_sessions ds
            JOIN drivers d ON d.driver_number = ds.driver_number
            WHERE ds.session_key = :session_key
            """
        ),
        {"session_key": session_key},
    ).mappings().all()
    return {
        r["driver_number"]: {"name": r["full_name"], "team": r["team_name"]}
        for r in rows
    }


def _fetch_stints(session_key: int, driver_numbers: list[int]) -> list[dict]:
    """Fetch tyre stints from OpenF1 for one session, iterating over drivers."""
    url = f"{config.openf1_base_url}/stints"
    all_stints: list[dict] = []
    for dn in driver_numbers:
        try:
            resp = requests.get(
                url,
                params={
                    "session_key": session_key,
                    "driver_number": dn,
                },
                timeout=config.request_timeout_seconds,
            )
            resp.raise_for_status()
            batch = resp.json()
            all_stints.extend(batch)
            time.sleep(config.request_delay_seconds)
        except Exception as e:
            print(f"    ⚠ stints fetch error for driver {dn}: {e}")
    return all_stints


def _stints_to_tyre_map(stints: list[dict], driver_numbers: list[int]) -> dict[int, list[dict]]:
    """Convert OpenF1 stints to a per-driver map: {driver_number: [{lap_start, lap_end, compound, color}, ...]}"""
    tyre_map: dict[int, list[dict]] = {dn: [] for dn in driver_numbers}
    for s in stints:
        dn = s.get("driver_number")
        if dn not in tyre_map:
            continue
        compound = s.get("compound", "UNKNOWN")
        tyre_map[dn].append({
            "lap_start": s.get("lap_start", 0),
            "lap_end": s.get("lap_end", 0),
            "compound": compound,
            "color": TYRE_COLORS.get(compound.upper(), "#888"),
        })
    return tyre_map


def _team_color(team_name: str | None) -> str:
    if not team_name:
        return "var(--border-color)"
    name = team_name.lower()
    if "red bull" in name:
        return "#3671c6"
    if "ferrari" in name:
        return "#f91536"
    if "mercedes" in name:
        return "#27f4d2"
    if "aston martin" in name:
        return "#229971"
    if "mclaren" in name:
        return "#ff8000"
    if "alpine" in name:
        return "#0093cc"
    if "williams" in name:
        return "#37bedd"
    if "haas" in name:
        return "#b6babd"
    if "alfa romeo" in name or "sauber" in name:
        return "#5e8faa"
    if "alphatauri" in name or "alpha tauri" in name:
        return "#c00000"
    return "var(--f1-red)"


def _build_bundle(
    session: dict,
    drivers: dict[int, dict],
    loc_df: pd.DataFrame,
    pos_df: pd.DataFrame,
    laps_df: pd.DataFrame,
    stints: list[dict],
    year: int,
) -> dict | None:
    if loc_df.empty:
        return None

    loc_df = loc_df.copy()
    loc_df["date"] = pd.to_datetime(loc_df["date"], utc=True)
    pos_df = pos_df.copy()
    if not pos_df.empty:
        pos_df["date"] = pd.to_datetime(pos_df["date"], utc=True)
    if not laps_df.empty:
        laps_df = laps_df.copy()
        laps_df["date_start"] = pd.to_datetime(laps_df["date_start"], utc=True)

    start_time = loc_df["date"].min()
    end_time = loc_df["date"].max()
    duration_seconds = (end_time - start_time).total_seconds()
    if duration_seconds <= 0:
        return None

    time_index = pd.date_range(
        start=start_time,
        end=end_time,
        freq=pd.Timedelta(seconds=FRAME_INTERVAL_SECONDS),
    )

    driver_numbers = sorted(drivers.keys())
    frames = []

    # Pre-compute coordinate normalization bounds.
    min_x = float(loc_df["x"].min())
    max_x = float(loc_df["x"].max())
    min_y = float(loc_df["y"].min())
    max_y = float(loc_df["y"].max())
    x_range = max_x - min_x if max_x != min_x else 1.0
    y_range = max_y - min_y if max_y != min_y else 1.0

    # Build per-driver location frames via resample/interpolate.
    loc_frames: dict[int, pd.DataFrame] = {}
    for num in driver_numbers:
        sub = loc_df[loc_df["driver_number"] == num].set_index("date")[["x", "y"]]
        if sub.empty:
            continue
        resampled = sub.reindex(sub.index.union(time_index))
        resampled = resampled.sort_index()
        resampled["x"] = resampled["x"].interpolate(method="linear")
        resampled["y"] = resampled["y"].interpolate(method="linear")
        resampled = resampled.loc[time_index]
        loc_frames[num] = resampled

    # Build per-driver position frames via forward fill.
    pos_frames: dict[int, pd.Series] = {}
    for num in driver_numbers:
        sub = pos_df[pos_df["driver_number"] == num]
        if sub.empty:
            pos_frames[num] = pd.Series(index=time_index, dtype="Int64")
            continue
        sub = sub.set_index("date")["position"].sort_index()
        resampled = sub.reindex(sub.index.union(time_index))
        resampled = resampled.ffill().loc[time_index]
        pos_frames[num] = resampled

    # Build per-driver lap-number frames via forward fill.
    lap_frames: dict[int, pd.Series] = {}
    for num in driver_numbers:
        sub = laps_df[laps_df["driver_number"] == num]
        if sub.empty:
            lap_frames[num] = pd.Series(index=time_index, dtype="Int64")
            continue
        sub = sub.set_index("date_start")["lap_number"].sort_index()
        resampled = sub.reindex(sub.index.union(time_index))
        lap_frames[num] = resampled.ffill().loc[time_index]

    total_laps = int(laps_df["lap_number"].max()) if not laps_df.empty and "lap_number" in laps_df.columns else 0

    for i, ts in enumerate(time_index):
        frame_coords = []
        frame_positions = []
        frame_laps = []
        for num in driver_numbers:
            loc = loc_frames.get(num)
            if loc is not None and ts in loc.index:
                row = loc.loc[ts]
                x_val = float(row["x"])
                y_val = float(row["y"])
                if pd.notna(x_val) and pd.notna(y_val):
                    nx = round((x_val - min_x) / x_range, 6)
                    ny = round((y_val - min_y) / y_range, 6)
                    frame_coords.append([nx, ny])
                else:
                    frame_coords.append([None, None])
            else:
                frame_coords.append([None, None])

            pos = pos_frames.get(num)
            if pos is not None and ts in pos.index:
                val = pos.loc[ts]
                frame_positions.append(int(val) if pd.notna(val) else None)
            else:
                frame_positions.append(None)

            lp = lap_frames.get(num)
            if lp is not None and ts in lp.index:
                val = lp.loc[ts]
                frame_laps.append(int(val) if pd.notna(val) else None)
            else:
                frame_laps.append(None)

        frames.append(
            {
                "t": round(i * FRAME_INTERVAL_SECONDS, 3),
                "positions": frame_positions,
                "coords": frame_coords,
                "laps": frame_laps,
            }
        )

    driver_meta = {
        str(num): {
            "name": drivers[num]["name"],
            "team": drivers[num]["team"],
            "team_color": _team_color(drivers[num]["team"]),
            "number": num,
        }
        for num in driver_numbers
    }

    tyre_map = _stints_to_tyre_map(stints, driver_numbers)

    return {
        "session_key": session["session_key"],
        "circuit_key": session["circuit_key"],
        "session_name": session.get("session_name"),
        "year": year,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_seconds": round(duration_seconds, 3),
        "frame_interval": FRAME_INTERVAL_SECONDS,
        "total_laps": total_laps,
        "driver_numbers": driver_numbers,
        "drivers": driver_meta,
        "tyres": tyre_map,
        "bounds": {
            "min_x": round(min_x, 3),
            "max_x": round(max_x, 3),
            "min_y": round(min_y, 3),
            "max_y": round(max_y, 3),
        },
        "frames": frames,
    }


def transform_simulation(year: int | None = None) -> list[Path]:
    year = year or config.years[0]
    SIMULATION_DIR.mkdir(parents=True, exist_ok=True)

    with get_sync_db() as db:
        sessions = _get_race_sessions(db)
        generated: list[Path] = []

        for session in sessions:
            session_key = session["session_key"]
            circuit_key = session["circuit_key"]

            drivers = _get_drivers(db, session_key)
            if not drivers:
                print(f"Session {session_key}: no drivers, skipping")
                continue

            print(f"Processing session {session_key} ({session.get('session_name')})...")

            loc_df = pd.read_sql(
                text(
                    """
                    SELECT driver_number, date, x, y
                    FROM locations
                    WHERE session_key = :session_key
                    ORDER BY driver_number, date
                    """
                ),
                db.bind,
                params={"session_key": session_key},
            )

            pos_df = pd.read_sql(
                text(
                    """
                    SELECT driver_number, date, position
                    FROM race_positions
                    WHERE session_key = :session_key
                    ORDER BY driver_number, date
                    """
                ),
                db.bind,
                params={"session_key": session_key},
            )

            laps_df = pd.read_sql(
                text(
                    """
                    SELECT driver_number, lap_number, date_start
                    FROM laps
                    WHERE session_key = :session_key
                    ORDER BY driver_number, lap_number
                    """
                ),
                db.bind,
                params={"session_key": session_key},
            )

            stints = _fetch_stints(session_key, sorted(drivers.keys()))
            tyre_count = sum(len(v) for v in _stints_to_tyre_map(stints, sorted(drivers.keys())).values())
            print(f"    stints: {len(stints)} records, {tyre_count} driver stints")

            bundle = _build_bundle(session, drivers, loc_df, pos_df, laps_df, stints, year)
            if bundle is None:
                print(f"  → session {session_key}: no usable telemetry, skipping")
                continue

            output_path = SIMULATION_DIR / f"simulation_{circuit_key}_{year}.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(bundle, f, separators=(",", ":"))

            print(
                f"  → {output_path.name}: {len(bundle['frames']):,} frames, "
                f"{len(bundle['driver_numbers'])} drivers"
            )
            generated.append(output_path)

    return generated


if __name__ == "__main__":
    for y in config.years:
        transform_simulation(y)
