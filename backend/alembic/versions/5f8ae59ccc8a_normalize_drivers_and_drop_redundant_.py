"""normalize drivers and drop redundant session columns

Revision ID: 5f8ae59ccc8a
Revises: c2df5d3f5cfb
Create Date: 2026-06-23 14:55:55.555032

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5f8ae59ccc8a'
down_revision: Union[str, Sequence[str], None] = 'c2df5d3f5cfb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop redundant columns from sessions.
    op.drop_column('sessions', 'country_name')
    op.drop_column('sessions', 'location')
    op.drop_column('sessions', 'circuit_short_name')

    # Normalize drivers: drop old composite PK and FK, truncate old data,
    # and create PK on driver_number.
    op.drop_constraint('drivers_session_key_fkey', 'drivers', type_='foreignkey')
    op.execute('TRUNCATE TABLE drivers')
    op.drop_constraint('drivers_pkey', 'drivers', type_='primary')
    op.create_primary_key('drivers_pkey', 'drivers', ['driver_number'])

    # Create driver_sessions junction table.
    op.create_table(
        'driver_sessions',
        sa.Column('session_key', sa.Integer(), nullable=False),
        sa.Column('driver_number', sa.Integer(), nullable=False),
        sa.Column('team_name', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['driver_number'], ['drivers.driver_number']),
        sa.ForeignKeyConstraint(['session_key'], ['sessions.session_key']),
        sa.PrimaryKeyConstraint('session_key', 'driver_number')
    )

    # Remove old per-session columns from drivers.
    op.drop_column('drivers', 'session_key')
    op.drop_column('drivers', 'team_name')


def downgrade() -> None:
    """Downgrade schema."""
    # Restore old drivers columns.
    op.add_column(
        'drivers',
        sa.Column('session_key', sa.INTEGER(), autoincrement=False, nullable=False)
    )
    op.add_column(
        'drivers',
        sa.Column('team_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True)
    )

    # Drop driver_sessions junction table.
    op.drop_table('driver_sessions')

    # Restore old composite PK on drivers.
    op.drop_constraint('drivers_pkey', 'drivers', type_='primary')
    op.create_primary_key('drivers_pkey', 'drivers', ['session_key', 'driver_number'])
    op.create_foreign_key(
        'drivers_session_key_fkey',
        'drivers',
        'sessions',
        ['session_key'],
        ['session_key']
    )

    # Restore redundant columns to sessions.
    op.add_column(
        'sessions',
        sa.Column('circuit_short_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True)
    )
    op.add_column(
        'sessions',
        sa.Column('location', sa.VARCHAR(length=100), autoincrement=False, nullable=True)
    )
    op.add_column(
        'sessions',
        sa.Column('country_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True)
    )
