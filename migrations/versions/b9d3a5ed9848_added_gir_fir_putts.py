"""Added gir, fir, putts

Revision ID: b9d3a5ed9848
Revises: bb7713733091
Create Date: 2021-06-02 15:20:42.521104

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b9d3a5ed9848'
down_revision = 'bb7713733091'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('round', sa.Column('fir', sa.Float(), nullable=True))
    op.add_column('round', sa.Column('gir', sa.Float(), nullable=True))
    op.add_column('round', sa.Column('putts', sa.Float(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('round', 'putts')
    op.drop_column('round', 'gir')
    op.drop_column('round', 'fir')
    # ### end Alembic commands ###
