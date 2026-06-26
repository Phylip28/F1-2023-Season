"""add simulation composite indexes

Revision ID: 2632514c70ef
Revises: 679e7323b79c
Create Date: 2026-06-23 21:32:11.539412

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2632514c70ef'
down_revision: Union[str, Sequence[str], None] = '679e7323b79c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add composite indexes used by the race simulation queries."""
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_locations_session_driver_date "
        "ON locations (session_key, driver_number, date)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_race_positions_session_driver_date "
        "ON race_positions (session_key, driver_number, date)"
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_laps_session_driver_lap "
        "ON laps (session_key, driver_number, lap_number)"
    )


def downgrade() -> None:
    """Drop composite indexes."""
    op.execute("DROP INDEX IF EXISTS ix_laps_session_driver_lap")
    op.execute("DROP INDEX IF EXISTS ix_race_positions_session_driver_date")
    op.execute("DROP INDEX IF EXISTS ix_locations_session_driver_date")
