from golfapp.models import Course, CourseTeebox
from golfapp import db
from flask_login import current_user


def create_course(name):
    course = Course(name=name)
    db.session.add(course)
    db.session.commit()

    return course


def create_teebox(course_id, teebox, par, slope, rating):
    teebox = CourseTeebox(
        course_id=course_id,
        teebox=teebox,
        par=par,
        slope=slope,
        rating=rating,
    )
    db.session.add(teebox)
    db.session.commit()


def get_course_by_id(course_id):
    return Course.query.filter_by(id=course_id).first()


def get_course_by_name(name):
    return Course.query.filter_by(name=name).first()


def add_course(name, teebox, par, rating, slope):
    course = get_course_by_name(name=name)
    if not course:
        course = create_course(name=name)

    create_teebox(
        course_id=course.id, teebox=teebox, par=par, slope=slope, rating=rating
    )


def get_courses(sort=False):
    courses = Course.query
    if sort:
        courses = courses.order_by(Course.name)

    return courses.all()


def get_courses_without_teeboxes(sort=False):
    courses = get_courses(sort=sort)
    return [c.to_dict(only=("id", "name")) for c in courses]


def get_teebox_by_id(teebox_id):
    return CourseTeebox.query.filter_by(id=teebox_id).first()


def update_course(course_id, name=None):
    if name is None:
        return

    course = get_course_by_id(course_id=course_id)
    course.name = name
    db.session.commit()


def update_teebox(teebox_id, name=None, par=None, rating=None, slope=None):
    teebox = get_teebox_by_id(teebox_id=teebox_id)

    if name is not None:
        teebox.teebox = name
    if par is not None:
        teebox.par = par
    if rating is not None:
        teebox.rating = rating
    if slope is not None:
        teebox.slope = slope

    db.session.commit()
