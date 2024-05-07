from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user
from golfapp.queries import course_queries, user_queries
from golfapp.utils import handicap_helpers


strokes_bp = Blueprint("strokes_bp", __name__)


@strokes_bp.route("/calculate_strokes", methods=["GET", "POST"])
def calculate_strokes():
    if request.method == "POST":
        course_id = request.form.get("course", type=int)
        teebox_id = request.form.get("teebox", type=int)
        players = request.form.getlist("players")
        players = [int(player) for player in players]
        strokes, course_name = handicap_helpers.calculate_strokes(
            course_id, teebox_id, players
        )
        strokes.sort(key=lambda x: x[1])
        return render_template("strokes.html", strokes=strokes, course=course_name)

    courses = [c.to_dict() for c in course_queries.get_courses(sort=True)]
    users = [u.to_dict() for u in user_queries.get_users_with_handicap()]
    users.sort(key=lambda u: u["handicap"]["handicap"])

    return render_template("strokes.html", users=users, courses=courses)
