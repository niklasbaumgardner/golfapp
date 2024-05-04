from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.models import User, Course, Round, Handicap, Theme, CourseTeebox
from golfapp.home import golf, queries, apiHelpers


api = Blueprint("api", __name__)


@api.route("/get_course_and_teebox_data", methods=["GET"])
def get_course_and_teebox_data():
    course_teebox_list = apiHelpers.get_course_teebox_list()
    return {"course_teebox_data": course_teebox_list}


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


@api.route("/get_rounds", methods=["GET"])
@login_required
def get_rounds():
    rounds = apiHelpers.get_rounds_list()
    return {"rounds": rounds}


@api.route("/get_courses", methods=["GET"])
@login_required
def get_courses():
    courses = apiHelpers.get_courses_dict()
    return {"courses": courses}
