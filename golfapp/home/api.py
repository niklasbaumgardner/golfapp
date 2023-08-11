from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.models import User, Course, Round, Handicap, Theme, CourseTeebox
from golfapp.home import golf, queries, apiHelpers


api = Blueprint("api", __name__)


@api.route("/get_course_and_teebox_data", methods=["GET"])
def get_course_and_teebox_data():
    course_teebox_list = apiHelpers.get_course_teebox_list()
    return {"course_teebox_data": course_teebox_list}


@api.route("/get_course_ranking_data/<int:user_id>", methods=["GET"])
def get_course_ranking_data(user_id):
    ranking_data = apiHelpers.get_course_ranking_dict_for_user_id(user_id=user_id)
    courses = apiHelpers.get_courses_list()

    return {"ranking_data": ranking_data, "courses": courses}


@api.route("/get_all_course_ranking_data", methods=["GET"])
def get_all_course_ranking_data():
    users = apiHelpers.get_users_dict()
    courses = apiHelpers.get_courses_dict()
    course_rankings = apiHelpers.get_all_course_rankings_dict()
    return {"users": users, "courses": courses, "course_rankings": course_rankings}


@api.route("/get_page", defaults={"id": None})
@api.route("/get_page/<int:id>")
def get_page(id):
    page = request.args.get("page", -1, type=int)

    if page < 1:
        return {"sucess": False}

    if not id and not current_user.is_authenticated:
        return {"page": page, "rounds": []}
    elif not id:
        id = current_user.id

    rounds, total, page, num_pages = queries.get_rounds_for_user_id(
        user_id=id, page=page, paginate=True, sort=True
    )
    rounds = golf.jsonify_rounds(rounds)
    return {"page": page, "rounds": rounds}
