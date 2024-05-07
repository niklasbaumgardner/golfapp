from golfapp.models import Course, CourseTeebox
from golfapp import db
from flask_login import current_user
from golfapp.queries import courseranking_queries, round_queries


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


def get_teebox_for_course_by_par_slope_rating(course_id, par, slope, rating):
    return CourseTeebox.query.filter_by(
        course_id=course_id, par=par, slope=slope, rating=rating
    ).first()


def deduplicate_course(duplicate_course_id, keep_course_id):
    if duplicate_course_id == keep_course_id:
        return False

    duplicate_course = get_course_by_id(course_id=duplicate_course_id)
    if not duplicate_course:
        return False

    keep_course = get_course_by_id(course_id=keep_course_id)
    if not keep_course:
        return False

    rounds = round_queries.get_rounds_by_course_id(course_id=duplicate_course.id)
    for round in rounds:
        round.course_id = keep_course.id
        print(f"setting round.course_id from {duplicate_course.id} to {keep_course.id}")

    course_rankings = courseranking_queries.get_course_rankings_by_course_id(
        course_id=duplicate_course.id
    )
    for cr in course_rankings:
        cr.course_id = keep_course.id
        print(
            f"setting courseranking.course_id from {duplicate_course.id} to {keep_course.id}"
        )

    teeboxes = duplicate_course.teeboxes
    for teebox in teeboxes:
        dup_teebox = get_teebox_for_course_by_par_slope_rating(
            course_id=keep_course.id,
            par=teebox.par,
            slope=teebox.slope,
            rating=teebox.rating,
        )
        if dup_teebox:
            print("got duplicate teebox")
            deduplicate_teebox(
                duplicate_teebox_id=teebox.id, keep_teebox_id=dup_teebox.id
            )
        else:
            teebox.course_id = keep_course.id
            print(
                f"setting teebox.course_id from {duplicate_course.id} to {keep_course.id}"
            )

    db.session.commit()
    delete_course(course_id=duplicate_course.id)


def deduplicate_teebox(duplicate_teebox_id, keep_teebox_id):

    if duplicate_teebox_id == keep_teebox_id:
        return False

    duplicate_teebox = get_teebox_by_id(teebox_id=duplicate_teebox_id)
    if not duplicate_teebox:
        return False

    keep_teebox = get_teebox_by_id(teebox_id=keep_teebox_id)
    if not keep_teebox:
        return False

    rounds = round_queries.get_rounds_by_teebox_id(teebox_id=duplicate_teebox.id)
    for round in rounds:
        round.teebox_id = keep_teebox.id
        print(f"setting round.teebox_id from {duplicate_teebox.id} to {keep_teebox.id}")

    db.session.commit()
    delete_teebox(teebox_id=duplicate_teebox.id)


def delete_course(course_id):
    course = get_course_by_id(course_id=course_id)

    if not course:
        return False

    print(f"Deleting course {course.name}")

    db.session.delete(course)
    db.session.commit()

    return True


def delete_teebox(teebox_id):
    teebox = get_teebox_by_id(teebox_id=teebox_id)

    if not teebox:
        return False

    print(f"Deleting teebox {teebox.teebox}")

    db.session.delete(teebox)
    db.session.commit()

    return True
