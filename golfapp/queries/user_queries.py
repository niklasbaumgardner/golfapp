from golfapp.models import User
from golfapp import db
from flask_login import current_user


def get_user(user_id):
    return User.query.filter_by(id=user_id).first()


def get_visible_users():
    return User.query.filter_by(is_publicly_visible=True).all()


def get_users():
    return User.query.filter_by().all()
