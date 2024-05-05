from golfapp.models import Course, CourseTeebox
from golfapp import db
from flask_login import current_user


def get_course_by_id(course_id):
    return Course.query.filter_by(id=course_id).first()


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
