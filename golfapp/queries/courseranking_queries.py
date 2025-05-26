from golfapp.models import CourseRanking
from golfapp import db
from flask_login import current_user


def create_course_ranking(course_id, rating):
    course_ranking = CourseRanking(
        user_id=current_user.id, course_id=course_id, rating=rating
    )
    db.session.add(course_ranking)
    db.session.commit()


def get_course_ranking(course_ranking_id):
    return CourseRanking.query.filter_by(id=course_ranking_id).first()


def get_course_rankings_for_user_id(user_id):
    return (
        CourseRanking.query.filter_by(user_id=user_id)
        .order_by(CourseRanking.rating.desc())
        .all()
    )


def get_course_ranking_by_id(id):
    return CourseRanking.query.filter_by(id=id, user_id=current_user.id).first()


def get_course_ranking_by_course_and_user(course_id, user_id):
    return CourseRanking.query.filter_by(course_id=course_id, user_id=user_id).first()


def get_course_rankings_for_current_user():
    return get_course_rankings_for_user_id(user_id=current_user.id)


def get_all_course_rankings():
    return CourseRanking.query.all()


def get_course_rankings_by_course_id(course_id):
    return CourseRanking.query.filter_by(course_id=course_id).all()


def update_course_ranking(rating, course_ranking=None, course_ranking_id=None):
    if not course_ranking and not course_ranking_id:
        return
    if not course_ranking:
        course_ranking = get_course_ranking(course_ranking_id=course_ranking_id)
    course_ranking.rating = rating
    db.session.commit()
