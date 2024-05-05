from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user, login_required
from golfapp.queries import (
    course_queries,
    handicap_queries,
    round_queries,
    user_queries,
)
from golfapp.utils import handicap_helpers


viewplayer_bp = Blueprint("viewplayer_bp", __name__)


@viewplayer_bp.route("/", methods=["GET"])
@login_required
def index():
    rounds = [r.to_dict() for r in round_queries.get_rounds(sort=True)]
    handicap = handicap_queries.get_handicap()
    if handicap:
        handicap = str(handicap)
    else:
        handicap = "No handicap"

    courses = {c.id: c.to_dict() for c in course_queries.get_courses()}
    rounds = handicap_helpers.get_included_rounds(rounds)

    return render_template(
        "view_player.html",
        user=current_user,
        rounds=rounds,
        courses=courses,
        handicap=handicap,
        is_visible=True,
        is_me=True,
    )


@viewplayer_bp.route("/view_player/<int:id>", methods=["GET"])
def view_player(id):
    if current_user.is_authenticated and current_user.id == id:
        return redirect(url_for("home.index"))

    rounds = [
        r.to_dict() for r in round_queries.get_rounds_for_user_id(user_id=id, sort=True)
    ]

    handicap = handicap_queries.get_handicap()
    if handicap:
        handicap = str(handicap)
    else:
        handicap = "No handicap"

    courses = {c.id: c.to_dict() for c in course_queries.get_courses()}
    rounds = handicap_helpers.get_included_rounds(rounds)
    user = user_queries.get_user_by_id(id)
    return render_template(
        "view_player.html",
        user=user,
        rounds=rounds,
        courses=courses,
        handicap=handicap,
    )
