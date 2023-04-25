from golfapp.models import Round, Course, Subscription, Subscriber, User
from golfapp.extensions import db
from sqlalchemy import extract
from flask_login import current_user
from datetime import date


def get_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user


def get_rounds(page=1, paginate=False, sort=False, max_rounds=None):
    rounds = Round.query.filter_by(user_id=current_user.get_id())

    if sort:
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


def get_course(course_id):
    course = Course.query.filter_by(id=course_id).first()
    return course


def update_course(c_id, name, teebox, par, slope, rating):
    course = get_course(course_id=c_id)

    course.name = name
    course.teebox = teebox
    course.par = par
    course.slope = slope
    course.rating = rating

    db.session.commit()


def create_subscription(user_id):
    subscription = Subscription(subscribed_to=user_id)
    db.session.add(subscription)
    db.session.commit()


def create_subscriber(subscribtion_id):
    subscriber = Subscriber(
        subscribtion_id=subscribtion_id, user_id=current_user.get_id()
    )
    db.session.add(subscriber)
    db.session.commit()


def get_subscription(user_id):
    subscription = Subscription.query.filter_by(subscribed_to=user_id).first()
    return subscription


def get_subscribers(user_id):
    subscription = get_subscription(user_id=user_id)

    subscribers = Subscriber.query.filter_by(subscribtion_id=subscription.id).all()
    return subscribers
