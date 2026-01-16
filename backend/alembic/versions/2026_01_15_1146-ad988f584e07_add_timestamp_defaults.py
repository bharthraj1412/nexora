# Alembic generic single-database configuration template

"""add_timestamp_defaults

Revision ID: ad988f584e07
Revises: 
Create Date: 2026-01-15 11:46:32.351387+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision: str = 'ad988f584e07'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add DEFAULT (datetime('now')) to timestamp columns.
    SQLite doesn't support ALTER COLUMN, so we use batch operations.
    """
    # For SQLite, we need to recreate tables with new defaults
    # Alembic's batch_alter_table handles this automatically
    
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)
        batch_op.alter_column('updated_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)
    
    with op.batch_alter_table('collections', schema=None) as batch_op:
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)
        batch_op.alter_column('updated_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)
    
    with op.batch_alter_table('records', schema=None) as batch_op:
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)
        batch_op.alter_column('updated_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)
    
    with op.batch_alter_table('activity_logs', schema=None) as batch_op:
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=sa.text("(datetime('now'))"),
                              nullable=False)


def downgrade() -> None:
    """
    Remove DEFAULT constraints from timestamp columns.
    """
    with op.batch_alter_table('activity_logs', schema=None) as batch_op:
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
    
    with op.batch_alter_table('records', schema=None) as batch_op:
        batch_op.alter_column('updated_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
    
    with op.batch_alter_table('collections', schema=None) as batch_op:
        batch_op.alter_column('updated_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
    
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('updated_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
        batch_op.alter_column('created_at',
                              existing_type=sa.DateTime(),
                              server_default=None,
                              nullable=False)
