"""scrore_diff -> score_diff

Revision ID: e6c46b7db98f
Revises: d54e801d4609
Create Date: 2022-06-05 00:47:28.719441

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e6c46b7db98f'
down_revision = 'd54e801d4609'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('round', sa.Column('score_diff', sa.Float(), nullable=True))
    op.drop_column('round', 'scrore_diff')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('round', sa.Column('scrore_diff', postgresql.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True))
    op.drop_column('round', 'score_diff')
    # ### end Alembic commands ###
