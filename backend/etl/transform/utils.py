"""Shared transformation utilities for normalizing OpenF1 data."""

from datetime import datetime


def normalize_int(value, default=None):
    if value is None:
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def normalize_float(value, default=None):
    if value is None:
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_bool(value, default=None):
    if value is None:
        return default
    return bool(value)


def normalize_datetime(value, default=None):
    if value is None or value == "":
        return default
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return default


def normalize_session_result_value(raw_value, session_type):
    """Return the relevant segment value for qualifying or the first for others."""
    if raw_value is None:
        return None
    if isinstance(raw_value, list):
        valid_values = [v for v in raw_value if v is not None]
        if not valid_values:
            return None
        if session_type == "Qualifying":
            return valid_values[-1]
        return valid_values[0]
    return raw_value


def normalize_gap(raw_gap, session_type):
    """Return (numeric_gap, raw_gap) tuple."""
    normalized = normalize_session_result_value(raw_gap, session_type)
    if normalized is None:
        return None, None
    if isinstance(normalized, str):
        try:
            return float(normalized), normalized
        except ValueError:
            return None, normalized
    try:
        return float(normalized), str(normalized)
    except (TypeError, ValueError):
        return None, str(normalized)
