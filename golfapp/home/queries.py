from golfapp.models import Round
from golfapp.extensions import db
from sqlalchemy import extract
from flask_login import current_user
from datetime import date


def get_rounds(page=1, paginate=False, sort=False):
    rounds = Round.query.filter_by(user_id=current_user.get_id())

    if sort:
        rounds = rounds.order_by(Round.date.desc())

    if paginate:
        rounds = rounds.paginate(page=page, per_page=20)
        return (
            rounds.items,
            rounds.total,
            rounds.page,
            rounds.pages,
        )

    return rounds.all()