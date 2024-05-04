from golfapp.models import (
    Round,
    Handicap,
    Course,
    Subscription,
    Subscriber,
    User,
    CourseTeebox,
    CourseRanking,
)
from golfapp import db
from flask_login import current_user


def get_handicap():
    return get_handicap_for_user_id(user_id=current_user.id)


def get_handicap_for_user_id(user_id):
    return Handicap.query.filter_by(user_id=user_id).first()
