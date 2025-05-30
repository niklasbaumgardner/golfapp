from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user, login_required
from golfapp.queries import course_queries, courseranking_queries, user_queries


courseranking_bp = Blueprint("courseranking_bp", __name__)


@courseranking_bp.get("/course_ranking")
@login_required
def my_course_ranking():
    user = user_queries.get_user_by_id(user_id=current_user.id)
    course_rankings = [
        cr.to_dict()
        for cr in courseranking_queries.get_course_rankings_for_user_id(
            user_id=current_user.id
        )
    ]
    courses = course_queries.get_courses_without_teeboxes()

    return render_template(
        "courseranking.html",
        user=user.to_dict(),
        is_me=True,
        course_rankings=course_rankings,
        courses=courses,
    )


@courseranking_bp.get("/course_ranking/<int:user_id>")
def course_ranking(user_id):
    user = user_queries.get_user_by_id(user_id=user_id)
    if not user:
        if current_user.is_authenticated:
            return redirect(url_for("courseranking_bp.my_course_ranking"))
        else:
            return redirect(url_for("auth_bp.login"))

    if current_user.is_authenticated and user.id == current_user.id:
        return redirect(url_for("courseranking_bp.my_course_ranking"))

    course_rankings = [
        cr.to_dict()
        for cr in courseranking_queries.get_course_rankings_for_user_id(user_id=user_id)
    ]
    courses = []
    return render_template(
        "courseranking.html",
        user=user.to_dict(),
        is_me=False,
        course_rankings=course_rankings,
        courses=courses,
    )


@courseranking_bp.post("/add_course_rating")
@login_required
def add_course_rating():
    course_id = request.form.get("course")
    rating = request.form.get("rating")

    course_ranking = courseranking_queries.get_course_ranking_by_course_and_user(
        course_id=course_id, user_id=current_user.id
    )
    if course_ranking:
        courseranking_queries.update_course_ranking(
            course_ranking=course_ranking, rating=rating
        )
    else:
        courseranking_queries.create_course_ranking(course_id, rating)

    ratings = [
        cr.to_dict()
        for cr in courseranking_queries.get_course_rankings_for_user_id(
            user_id=current_user.id
        )
    ]

    return redirect(url_for("courseranking_bp.my_course_ranking"))
    return {"ratings": ratings}


@courseranking_bp.post("/edit_rating/<int:id>")
@login_required
def edit_rating(id):
    course_id = request.form.get("course")
    rating = request.form.get("rating")

    course_ranking = courseranking_queries.get_course_ranking_by_id(id=id)
    if course_ranking:
        courseranking_queries.update_course_ranking(
            course_ranking=course_ranking, rating=rating
        )
    else:
        courseranking_queries.create_course_ranking(course_id, rating)

    ratings = [
        cr.to_dict()
        for cr in courseranking_queries.get_course_rankings_for_user_id(
            user_id=current_user.id
        )
    ]

    # return redirect(url_for("courseranking_bp.my_course_ranking"))
    return {"ratings": ratings}


@courseranking_bp.route("/course_rankings", methods={"GET"})
def course_rankings():
    course_rankings = [
        cr.to_dict() for cr in courseranking_queries.get_all_course_rankings()
    ]
    return render_template("courserankings.html", course_rankings=course_rankings)
