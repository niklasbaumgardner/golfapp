from golfapp.models import CourseRanking
from golfapp import db
from flask_login import current_user
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert


def upsert_course_ranking(course_id, rating):
    stmt = pg_insert(CourseRanking).values(
        user_id=current_user.id, course_id=course_id, rating=rating
    )

    upsert_stmt = stmt.on_conflict_do_update(
        constraint="course_ranking_user_id_course_id_key",
        set_={"rating": stmt.excluded.rating},
    )

    db.session.execute(upsert_stmt)

    db.session.commit()


def get_course_rankings_for_user_id(user_id):
    stmt = (
        select(CourseRanking)
        .where(CourseRanking.user_id == user_id)
        .order_by(CourseRanking.rating.desc())
    )
    return db.session.scalars(stmt).unique().all()


def get_all_course_rankings():
    stmt = select(CourseRanking).order_by(CourseRanking.rating.desc())
    return db.session.scalars(stmt).unique().all()


def get_course_rankings_by_course_id(course_id):
    stmt = (
        select(CourseRanking)
        .where(CourseRanking.course_id == course_id)
        .order_by(CourseRanking.rating.desc())
    )
    return db.session.scalars(stmt).all()
