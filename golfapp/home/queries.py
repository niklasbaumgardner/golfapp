from golfapp.models import (
    Round,
    Course,
    Subscription,
    Subscriber,
    User,
    CourseTeebox,
    CourseRanking,
)
from golfapp import db
from flask_login import current_user


def get_rounds_for_course_id(course_id):
    return Round.query.filter_by(course_id=course_id).all()


def get_rounds_by_teebox_id(teebox_id):
    return Round.query.filter_by(teebox_id=teebox_id).all()


def get_courses(sort=False):
    courses = Course.query
    if sort:
        courses = courses.order_by(Course.name)

    return courses.all()


def get_course(course_id):
    course = Course.query.filter_by(id=course_id).first()
    return course


def get_course_by_name(name):
    return Course.query.filter_by(name=name).first()


def update_course(c_id, name):
    course = get_course(course_id=c_id)

    course.name = name

    db.session.commit()


def delete_course(course_id):
    course = get_course(course_id=course_id)
    db.session.delete(course)
    db.session.commit()


def get_courses_teeboxes_joined():
    return (
        db.session.query(Course, CourseTeebox)
        .join(CourseTeebox, Course.id == CourseTeebox.course_id)
        .all()
    )


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


def update_teebox(teebox_id, teebox_name, par, slope, rating):
    teebox = get_teebox(teebox_id=teebox_id)

    teebox.teebox = teebox_name
    teebox.par = par
    teebox.slope = slope
    teebox.rating = rating

    db.session.commit()


def delete_teebox(teebox_id):
    teebox = get_teebox(teebox_id=teebox_id)
    db.session.delete(teebox)
    db.session.commit()


def create_subscription(user_id):
    subscription = Subscription(subscribed_to=user_id)
    db.session.add(subscription)
    db.session.commit()


def create_subscriber(subscribtion_id, user_id):
    subscriber = Subscriber(subscribtion_id=subscribtion_id, user_id=user_id)
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
