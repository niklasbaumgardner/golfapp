from golfapp.models import Round
from golfapp import db
from flask_login import current_user


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
