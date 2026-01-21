"""Add shop to propertytype enum

Revision ID: 7a8a4dbac98a
Revises: b6710d09b9a2
Create Date: 2026-01-12 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a8a4dbac98a'
down_revision = 'b6710d09b9a2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use autocommit for ALTER TYPE
    op.execute("COMMIT")
    op.execute("ALTER TYPE propertytype ADD VALUE IF NOT EXISTS 'shop'")
    op.execute("ALTER TYPE propertytype ADD VALUE IF NOT EXISTS 'SHOP'")


def downgrade() -> None:
    # Standard PostgreSQL doesn't support easy removal of values from enums
    # We can leave them as is or do a complex migration. For this project, leaving is safer.
    pass
