from golfapp.models import Round, Course, Subscription, Subscriber, User, CourseTeebox
from golfapp.extensions import db
from sqlalchemy import extract
from flask_login import current_user
from datetime import date


def get_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user


def get_users():
    return User.query.all()


def get_rounds(page=1, paginate=False, sort=False, max_rounds=None):
    return get_rounds_for_user_id(
        user_id=current_user.get_id(),
        page=page,
        paginate=paginate,
        sort=sort,
        max_rounds=max_rounds,
    )


def get_rounds_for_user_id(
    user_id=None, page=1, paginate=None, sort=False, max_rounds=None
):
    if not user_id:
        return None

    rounds = Round.query.filter_by(user_id=user_id)

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


def get_rounds_for_course_id(course_id):
    return Round.query.filter_by(course_id=course_id).all()


def get_courses(sort=False):
    courses = Course.query
    if sort:
        courses = courses.order_by(Course.name)

    return courses


def get_course(course_id):
    course = Course.query.filter_by(id=course_id).first()
    return course


def get_course_by_name(name):
    return Course.query.filter_by(name=name).first()


def update_course(c_id, name, teebox, par, slope, rating):
    course = get_course(course_id=c_id)

    course.name = name
    course.teebox = teebox
    course.par = par
    course.slope = slope
    course.rating = rating

    db.session.commit()


def create_teebox(course_id, par, teebox, rating, slope):
    teebox = CourseTeebox(
        course_id=course_id, par=par, teebox=teebox, rating=rating, slope=slope
    )
    db.session.add(teebox)
    db.session.commit()


def get_teebox(teebox_id):
    return CourseTeebox.query.filter_by(id=teebox_id).first()


def get_teeboxes_for_course(course_id):
    return CourseTeebox.query.filter_by(course_id=course_id).all()


def get_teeboxes():
    return CourseTeebox.query.all()


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


def get_subscribers(subscription_id):
    return Subscriber.query.filter_by(subscribtion_id=subscription_id).all()


def get_subscribers_for_user_id(user_id):
    subscription = get_subscription(user_id=user_id)

    if not subscription:
        return

    subscribers = Subscriber.query.filter_by(subscribtion_id=subscription.id).all()
    return subscribers
