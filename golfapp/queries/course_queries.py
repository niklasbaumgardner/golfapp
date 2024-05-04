from golfapp.models import Course
from golfapp import db
from flask_login import current_user


def get_courses(sort=False):
    courses = Course.query
    if sort:
        courses = courses.order_by(Course.name)

    return courses.all()


def get_courses_without_teeboxes(sort=False):
    courses = get_courses(sort=sort)
    return [c.to_dict(only=("id", "name")) for c in courses]
