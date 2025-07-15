from golfapp.models import Handicap
from golfapp import db
from flask_login import current_user
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert


def upsert_handicap_for_user(user_id, handicap_diff):
    # Is this needed?
    current_user_id = int(current_user.id)
    user_id = int(user_id)
    if current_user_id == user_id:
        pass
    elif not current_user.is_admin:
        return

    stmt = pg_insert(Handicap).values(user_id=user_id, handicap=handicap_diff)

    upsert_stmt = stmt.on_conflict_do_update(
        index_elements=["user_id"],
        set_={"handicap": stmt.excluded.handicap},
    )

    db.session.execute(upsert_stmt)

    db.session.commit()


def upsert_handicap(handicap_diff):
    upsert_handicap_for_user(user_id=current_user.id, handicap_diff=handicap_diff)


def get_handicap_for_user_id(user_id):
    stmt = select(Handicap).where(Handicap.user_id == user_id).limit(1)
    return db.session.scalars(stmt).first()


def get_handicap():
    return get_handicap_for_user_id(user_id=current_user.id)
