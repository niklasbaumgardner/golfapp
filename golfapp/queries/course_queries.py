from golfapp.models import Course, CourseTeebox
from golfapp import db
from flask_login import current_user
from golfapp.queries import courseranking_queries, round_queries
from sqlalchemy import delete, insert, select, update
from sqlalchemy.sql import and_


def create_course(name, commit=True):
    stmt = insert(Course).values(name=name)
    result = db.session.execute(stmt)

    if commit:
        db.session.commit()
    else:
        db.session.flush()

    course_id = result.inserted_primary_key[0]
    return course_id


def create_teebox(course_id, teebox, par, slope, rating):
    stmt = insert(CourseTeebox).values(
        course_id=course_id,
        teebox=teebox,
        par=par,
        slope=slope,
        rating=rating,
    )

    db.session.execute(stmt)
    db.session.commit()


def get_course_by_id(course_id):
    stmt = select(Course).where(Course.id == course_id).limit(1)
    return db.session.scalars(stmt).first()


def get_course_by_name(name):
    stmt = select(Course).where(Course.name == name).limit(1)
    return db.session.scalars(stmt).first()


def add_course(name, teebox, par, rating, slope):
    course = get_course_by_name(name=name)
    course_id = None
    if not course:
        course_id = create_course(name=name)
    else:
        course_id = course.id

    create_teebox(
        course_id=course_id, teebox=teebox, par=par, slope=slope, rating=rating
    )

    return course


def get_courses(sort=False):
    stmt = select(Course)
    if sort:
        stmt = stmt.order_by(Course.name)

    return db.session.scalars(stmt).unique().all()


# Remove me
def get_courses_without_teeboxes(sort=False):
    courses = get_courses(sort=sort)
    return [c.to_dict(only=("id", "name")) for c in courses]


def get_teebox_by_id(teebox_id):
    stmt = select(CourseTeebox).where(CourseTeebox.id == teebox_id).limit(1)
    return db.session.scalars(stmt).first()


def get_teeboxes_by_course_id(course_id):
    stmt = select(CourseTeebox).where(CourseTeebox.course_id == course_id)
    return db.session.scalars(stmt).all()


def update_course(course_id, name=None):
    if name is None:
        return

    stmt = update(Course).where(Course.id == course_id).values(name=name)
    db.session.execute(stmt)
    db.session.commit()


def update_teebox(teebox_id, name=None, par=None, rating=None, slope=None):
    stmt = update(CourseTeebox).where(CourseTeebox.id == teebox_id)

    update_dict = dict()
    if name is not None:
        update_dict["teebox"] = name
    if par is not None:
        update_dict["par"] = par
    if rating is not None:
        update_dict["rating"] = rating
    if slope is not None:
        update_dict["slope"] = slope

    db.session.execute(stmt)
    db.session.commit()


def get_teebox_for_course_by_par_slope_rating(course_id, par, slope, rating):
    stmt = (
        select(CourseTeebox)
        .where(
            and_(
                CourseTeebox.course_id == course_id,
                CourseTeebox.par == par,
                CourseTeebox.slope == slope,
                CourseTeebox.rating == rating,
            )
        )
        .limit(1)
    )
    return db.session.scalars(stmt).first()


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
    if not current_user.is_admin:
        return False

    stmt = delete(Course).where(Course.id == course_id)
    db.session.execute(stmt)
    db.session.commit()

    return True


def delete_teebox(teebox_id):
    if not current_user.is_admin:
        return False

    stmt = delete(CourseTeebox).where(CourseTeebox.id == teebox_id)
    db.session.execute(stmt)
    db.session.commit()

    return True
