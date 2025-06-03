from golfapp.models import Handicap
from golfapp import db
from flask_login import current_user


def create_handicap(handicap_diff):
    return create_handicap_for_user(
        user_id=current_user.get_id(), handicap_diff=handicap_diff
    )


def create_handicap_for_user(user_id, handicap_diff):
    handicap = Handicap(user_id=user_id, handicap=handicap_diff)
    db.session.add(handicap)
    db.session.commit()

    return handicap


def create_or_update_handicap(user_id, handicap_diff):
    updated = update_handicap_for_user(user_id=user_id, handicap_diff=handicap_diff)

    if not updated:
        create_handicap_for_user(user_id=user_id, handicap_diff=handicap_diff)


def update_handicap(handicap_diff):
    return update_handicap_for_user(
        user_id=current_user.id, handicap_diff=handicap_diff
    )


def update_handicap_for_user(user_id, handicap_diff):
    handicap = get_handicap_for_user_id(user_id=user_id)
    if not handicap:
        return False

    handicap.handicap = handicap_diff
    db.session.commit()

    return True


def get_handicap():
    return get_handicap_for_user_id(user_id=current_user.id)


def get_handicap_for_user_id(user_id):
    return Handicap.query.filter_by(user_id=user_id).first()
