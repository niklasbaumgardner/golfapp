from golfapp.models import Handicap, User
from golfapp import bcrypt, db


def create_user(email, username, password):
    hash_ = hash_password(password=password)
    new_user = User(email=email, username=username, password=hash_)
    db.session.add(new_user)
    db.session.commit()


def get_user_by_id(user_id):
    return User.query.filter_by(id=user_id).first()


def get_user_by_email(email):
    return User.query.filter_by(email=email).first()


def get_visible_users():
    return User.query.filter_by(is_publicly_visible=True).all()


def get_users_with_handicap():
    return User.query.where(Handicap.query.filter_by(user_id=User.id).exists()).all()


def get_users():
    return User.query.filter_by().all()


def update_user(user_id, username, email):
    user = get_user_by_id(user_id=user_id)

    username = username if is_username_unique(username=username) else None
    email = email if is_email_unique(email=email) else None

    if username:
        user.username = username

    if email:
        user.email = email

    db.session.commit()


def update_user_password(id, password):
    if not password or not id:
        return

    user = get_user_by_id(user_id=id)
    hash_ = hash_password(password=password)
    user.password = hash_

    db.session.commit()


def hash_password(password):
    return bcrypt.generate_password_hash(password=password).decode("utf-8")


def is_email_unique(email):
    return not User.query.filter_by(email=email).first()


def is_username_unique(username):
    return not User.query.filter_by(username=username).first()
