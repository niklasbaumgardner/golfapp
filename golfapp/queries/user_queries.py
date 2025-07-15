from golfapp.models import Handicap, User
from golfapp import bcrypt, db
from flask_login import current_user
from sqlalchemy import func, insert, select, update


def create_user(email, username, password):
    hash_ = hash_password(password=password)
    stmt = insert(User).values(
        email=email, username=username, password=hash_, is_publicly_visible=True
    )
    db.session.execute(stmt)
    db.session.commit()


def get_user_by_id(user_id):
    stmt = select(User).where(User.id == user_id).limit(1)
    return db.session.scalars(stmt).first()


def get_user_by_email(email):
    stmt = select(User).where(User.email == email).limit(1)
    return db.session.scalars(stmt).first()


def get_visible_users():
    stmt = select(User).where(User.is_publicly_visible.is_(True))
    return db.session.scalars(stmt).all()


def get_users_with_handicap():
    stmt = (
        select(User)
        .join(Handicap, User.id == Handicap.user_id)
        .where(User.is_publicly_visible.is_(True))
    )
    return db.session.scalars(stmt).all()


def get_users():
    stmt = select(User)
    return db.session.scalars(stmt).all()


def update_user(username, email):
    update_dict = dict()
    if username is not None:
        update_dict["username"] = username.strip()
    if email is not None:
        update_dict["email"] = email.strip()

    stmt = update(User).where(User.id == current_user.id).values(update_dict)

    db.session.execute(stmt)
    db.session.commit()


def update_user_password(id, password):
    if not password or not id:
        return

    user = get_user_by_id(user_id=id)
    if not user:
        return
    hash_ = hash_password(password=password)

    stmt = update(User).where(User.id == user.id).values(password=hash_)

    db.session.execute(stmt)
    db.session.commit()


def hash_password(password):
    return bcrypt.generate_password_hash(password=password).decode("utf-8")


def is_email_unique(email):
    stmt = select(func.count()).where(User.email == email)
    count = db.session.execute(stmt).scalar_one()
    return count == 0


def is_username_unique(username):
    stmt = select(func.count()).where(User.username == username)
    count = db.session.execute(stmt).scalar_one()
    return count == 0
