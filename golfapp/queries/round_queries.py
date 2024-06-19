from golfapp.models import Round
from golfapp import db
from flask_login import current_user


def create_round(course_id, teebox_id, score, score_diff, fir, gir, putts, date):

    round = Round(
        user_id=current_user.get_id(),
        course_id=course_id,
        teebox_id=teebox_id,
        score=score,
        score_diff=score_diff,
        fir=fir,
        gir=gir,
        putts=putts,
        date=date,
    )
    db.session.add(round)
    db.session.commit()

    return round


def update_round(
    round_id, score=None, score_diff=None, fir=None, gir=None, putts=None, date=None
):
    round = get_round_by_id(round_id=round_id)

    if not round:
        return None

    if score is not None:
        round.score = score
    if score_diff is not None:
        round.score_diff = score_diff
    if fir is not None:
        round.fir = fir
    if gir is not None:
        round.gir = gir
    if putts is not None:
        round.putts = putts
    if date is not None:
        round.date = date

    db.session.commit()

    return round


def get_rounds(page=1, paginate=False, sort=False, reverse_sort=False, max_rounds=None):
    return get_rounds_for_user_id(
        user_id=current_user.get_id(),
        page=page,
        paginate=paginate,
        sort=sort,
        reverse_sort=reverse_sort,
        max_rounds=max_rounds,
    )


def get_rounds_for_user_id(
    user_id=None, page=1, paginate=None, sort=False, reverse_sort=False, max_rounds=None
):
    if not user_id:
        return None

    rounds = Round.query.filter_by(user_id=user_id)

    if sort:
        if reverse_sort:
            rounds = rounds.order_by(Round.date)
        else:
            rounds = rounds.order_by(Round.date.desc())

    if max_rounds:
        rounds = rounds.limit(max_rounds)

    if paginate:
        rounds = rounds.paginate(page=page, per_page=20)
        return (
            rounds.items,
            rounds.total,
            rounds.page,
            rounds.pages,
        )

    return rounds.all()


def get_round_by_id(round_id):
    return Round.query.filter_by(user_id=current_user.id, id=round_id).first()


def get_rounds_by_course_id(course_id):
    return Round.query.filter_by(course_id=course_id).all()


def get_rounds_by_teebox_id(teebox_id):
    return Round.query.filter_by(teebox_id=teebox_id).all()


def delete_round(round_id):
    round = get_round_by_id(round_id=round_id)

    if not round:
        return False

    db.session.delete(round)
    db.session.commit()

    return True
