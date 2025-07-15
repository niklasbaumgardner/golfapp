from golfapp.models import Round
from golfapp import db
from flask_login import current_user
from golfapp.utils import handicap_helpers
from sqlalchemy import delete, insert, select, update, asc, desc
from sqlalchemy.sql import and_


def create_round(
    course_id, teebox_id, score, score_diff, nine_hole_round, fir, gir, putts, date
):
    stmt = insert(Round).values(
        user_id=current_user.id,
        course_id=course_id,
        teebox_id=teebox_id,
        score=score,
        score_diff=score_diff,
        nine_hole_round=nine_hole_round,
        fir=fir,
        gir=gir,
        putts=putts,
        date=date,
    )
    db.session.execute(stmt)
    db.session.commit()


def create_round_for_user(
    user_id,
    course_id,
    teebox_id,
    score,
    score_diff,
    nine_hole_round,
    fir,
    gir,
    putts,
    date,
):
    if not current_user.is_admin:
        return

    stmt = insert(Round).values(
        user_id=user_id,
        course_id=course_id,
        teebox_id=teebox_id,
        score=score,
        score_diff=score_diff,
        nine_hole_round=nine_hole_round,
        fir=fir,
        gir=gir,
        putts=putts,
        date=date,
    )
    db.session.execute(stmt)
    db.session.commit()


def update_round(
    round_id,
    score=None,
    fir=None,
    gir=None,
    putts=None,
    date=None,
    nine_hole_round=None,
):
    round = get_round_by_id(round_id=round_id)

    if not round:
        return None

    should_update_handicap = False
    update_dict = dict()

    if score is not None and score != round.score:
        update_dict["score"] = score

        score_diff = handicap_helpers.get_score_diff(
            teebox_id=round.teebox_id,
            score=score,
            nine_hole_round=round.nine_hole_round,
        )

        update_dict["score_diff"] = score_diff

        should_update_handicap = True

    if fir is not None and fir != round.fir:
        update_dict["fir"] = fir
    if gir is not None and gir != round.gir:
        update_dict["gir"] = gir
    if putts is not None and putts != round.putts:
        update_dict["putts"] = putts
    if nine_hole_round is not None and nine_hole_round != round.nine_hole_round:
        update_dict["nine_hole_round"] = nine_hole_round

        score_diff = handicap_helpers.get_score_diff(
            teebox_id=round.teebox_id,
            score=score,
            nine_hole_round=round.nine_hole_round,
        )

        update_dict["score_diff"] = score_diff
        should_update_handicap = True

    if date is not None:
        update_dict["date"] = date
        should_update_handicap = True

    stmt = update(Round).where(Round.id == round_id).values(update_dict)
    db.session.execute(stmt)
    db.session.commit()

    if should_update_handicap:
        handicap_helpers.update_handicap()


def get_rounds_for_user_id(
    user_id=None, sort=False, reverse_sort=False, max_rounds=None
):
    if not user_id:
        return None

    stmt = select(Round).where(Round.user_id == user_id)

    if sort:
        if reverse_sort:
            stmt = stmt.order_by(Round.date)
        else:
            stmt = stmt.order_by(desc(Round.date), asc(Round.score_diff))

    if max_rounds:
        stmt = stmt.limit(max_rounds)

    return db.session.scalars(stmt).unique().all()


def get_rounds(sort=False, reverse_sort=False, max_rounds=None):
    return get_rounds_for_user_id(
        user_id=current_user.get_id(),
        sort=sort,
        reverse_sort=reverse_sort,
        max_rounds=max_rounds,
    )


def get_round_by_id(round_id):
    stmt = (
        select(Round)
        .where(and_(Round.id == round_id, Round.user_id == current_user.id))
        .limit(1)
    )
    return db.session.scalars(stmt).first()


def get_rounds_by_course_id(course_id):
    stmt = select(Round).where(Round.course_id == course_id)
    return db.session.scalars(stmt).all()


def get_rounds_by_teebox_id(teebox_id):
    stmt = select(Round).where(Round.teebox_id == teebox_id)
    return db.session.scalars(stmt).all()


def get_all_rounds():
    stmt = select(Round)
    return db.session.scalars(stmt).all()


def delete_round(round_id):
    stmt = delete(Round).where(
        and_(Round.id == round_id, Round.user_id == current_user.id)
    )
    db.session.execute(stmt)
    db.session.commit()

    return True
