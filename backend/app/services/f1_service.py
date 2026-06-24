"""F1 data services backed by PostgreSQL with optional TTL caching."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.cache import cache
from app.models import Circuit, Driver, DriverSession, Session, SessionResult, Weather


def _normalize_session_result_value(raw_value: Any, session_type: str | None) -> Any:
    if raw_value is None:
        return None

    if isinstance(raw_value, list):
        valid_values = [value for value in raw_value if value is not None]
        if not valid_values:
            return None

        if session_type == "Qualifying":
            return valid_values[-1]

        return valid_values[0]

    return raw_value


def _normalize_gap_to_leader(raw_gap: Any, session_type: str | None) -> float | str | None:
    normalized_gap = _normalize_session_result_value(raw_gap, session_type)
    if normalized_gap is None:
        return None

    if isinstance(normalized_gap, str):
        try:
            return float(normalized_gap)
        except ValueError:
            return normalized_gap

    return normalized_gap


def _normalize_duration(raw_duration: Any, session_type: str | None) -> float | None:
    normalized_duration = _normalize_session_result_value(raw_duration, session_type)
    if normalized_duration is None:
        return None

    try:
        return float(normalized_duration)
    except (TypeError, ValueError):
        return None


async def _latest_session(
    db: AsyncSession, circuit_key: int, session_type: str
) -> Session | None:
    """Return the latest session of a given type for a circuit."""
    result = await db.execute(
        select(Session)
        .where(Session.circuit_key == circuit_key)
        .where(Session.session_type == session_type)
        .order_by(Session.date_start.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_circuit_data(db: AsyncSession, circuit_key: int) -> list[dict[str, Any]]:
    async def _fetch() -> list[dict[str, Any]]:
        result = await db.execute(
            select(Session, Circuit)
            .join(Circuit, Session.circuit_key == Circuit.circuit_key)
            .where(Session.circuit_key == circuit_key)
            .order_by(Session.date_start)
        )
        rows = []
        for session, circuit in result.all():
            rows.append(
                {
                    "session_type": session.session_type,
                    "session_name": session.session_name,
                    "date_start": session.date_start,
                    "date_end": session.date_end,
                    "circuit_short_name": circuit.circuit_short_name,
                    "country_name": circuit.country_name,
                    "location": circuit.location,
                }
            )
        return rows

    return await cache.get_or_set(("circuit_data", circuit_key), _fetch)


async def filter_sessions_by_type(
    db: AsyncSession, circuit_key: int, session_type: str
) -> list[dict[str, Any]]:
    async def _fetch() -> list[dict[str, Any]]:
        result = await db.execute(
            select(Session, Circuit)
            .join(Circuit, Session.circuit_key == Circuit.circuit_key)
            .where(Session.circuit_key == circuit_key)
            .where(Session.session_type == session_type)
            .order_by(Session.date_start)
        )
        rows = []
        for session, circuit in result.all():
            rows.append(
                {
                    "session_type": session.session_type,
                    "session_name": session.session_name,
                    "date_start": session.date_start,
                    "date_end": session.date_end,
                    "circuit_short_name": circuit.circuit_short_name,
                    "country_name": circuit.country_name,
                    "location": circuit.location,
                }
            )
        return rows

    return await cache.get_or_set(
        ("filtered_sessions", circuit_key, session_type), _fetch
    )


async def get_driver_classification(
    db: AsyncSession, circuit_key: int, session_type: str
) -> list[dict[str, Any]] | dict[str, str]:
    async def _fetch() -> list[dict[str, Any]]:
        session = await _latest_session(db, circuit_key, session_type)
        if session is None:
            return []

        result = await db.execute(
            select(SessionResult, Driver, DriverSession, Circuit)
            .join(Driver, SessionResult.driver_number == Driver.driver_number)
            .join(
                DriverSession,
                (SessionResult.session_key == DriverSession.session_key)
                & (SessionResult.driver_number == DriverSession.driver_number),
            )
            .join(Session, SessionResult.session_key == Session.session_key)
            .join(Circuit, Session.circuit_key == Circuit.circuit_key)
            .where(SessionResult.session_key == session.session_key)
            .order_by(SessionResult.position)
        )

        rows = []
        for sr, driver, driver_session, circuit in result.all():
            rows.append(
                {
                    "position": sr.position,
                    "driver_number": sr.driver_number,
                    "driver_name": driver.full_name,
                    "team_name": driver_session.team_name,
                    "number_of_laps": sr.number_of_laps,
                    "duration": _normalize_duration(sr.duration, session.session_type),
                    "gap_to_leader": _normalize_gap_to_leader(
                        sr.gap_to_leader_raw or sr.gap_to_leader, session.session_type
                    ),
                    "dnf": sr.dnf,
                    "dns": sr.dns,
                    "dsq": sr.dsq,
                    "session_key": session.session_key,
                    "session_name": session.session_name,
                    "session_type": session.session_type,
                    "circuit_short_name": circuit.circuit_short_name,
                }
            )
        return rows

    return await cache.get_or_set(
        ("driver_classification", circuit_key, session_type), _fetch
    )


async def get_race_weather(
    db: AsyncSession, circuit_key: int
) -> list[dict[str, Any]] | dict[str, str]:
    async def _fetch() -> list[dict[str, Any]]:
        session = await _latest_session(db, circuit_key, "Race")
        if session is None:
            return []

        result = await db.execute(
            select(Weather)
            .where(Weather.session_key == session.session_key)
            .order_by(Weather.date)
        )
        return [
            {
                "date": w.date,
                "session_key": w.session_key,
                "meeting_key": session.meeting_key,
                "air_temperature": w.air_temperature,
                "track_temperature": w.track_temperature,
                "humidity": w.humidity,
                "pressure": w.pressure,
                "wind_speed": w.wind_speed,
                "wind_direction": w.wind_direction,
                "rainfall": w.rainfall,
            }
            for w in result.scalars().all()
        ]

    return await cache.get_or_set(("race_weather", circuit_key), _fetch)
