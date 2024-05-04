from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user
from golfapp.queries import course_queries, courseranking_queries, user_queries


courseranking_bp = Blueprint("courseranking_bp", __name__)


@courseranking_bp.route("/course_ranking", defaults={"user_id": None}, methods=["GET"])
@courseranking_bp.route("/course_ranking/<int:user_id>", methods=["GET", "POST"])
def course_ranking(user_id):
    if not user_id and not current_user.is_authenticated:
        return redirect(url_for("auth.login"))

    if request.method == "POST":
        if user_id == current_user.id:
            course_id = request.form.get("course")
            rating = request.form.get("rating")

            course_ranking = (
                courseranking_queries.get_course_ranking_by_course_and_user(
                    course_id=course_id, user_id=current_user.id
                )
            )
            if course_ranking:
                courseranking_queries.update_course_ranking(
                    course_ranking=course_ranking, rating=rating
                )
            else:
                courseranking_queries.create_course_ranking(course_id, rating)
            return redirect(url_for("courseranking_bp.course_ranking"))

    if not user_id and current_user.is_authenticated:
        user_id = current_user.id

    is_me = current_user.is_authenticated and user_id == current_user.id
    user = user_queries.get_user(user_id=user_id)
    course_rankings = [
        cr.to_dict()
        for cr in courseranking_queries.get_course_rankings_for_user_id(user_id=user_id)
    ]
    courses = []
    if is_me:
        courses = course_queries.get_courses_without_teeboxes()
    return render_template(
        "courseranking.html",
        user_id=user_id,
        username=user.username,
        is_me=is_me,
        course_rankings=course_rankings,
        courses=courses,
    )


@courseranking_bp.route("/course_rankings", methods={"GET"})
def course_rankings():
    course_rankings = [
        cr.to_dict() for cr in courseranking_queries.get_all_course_rankings()
    ]
    return render_template("courserankings.html", course_rankings=course_rankings)
