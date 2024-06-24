from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user, login_required
from golfapp.queries import (
    course_queries,
    handicap_queries,
    round_queries,
    user_queries,
)
from golfapp.utils import handicap_helpers, send_email


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


@viewplayer_bp.route("/add_round_submit", methods=["POST"])
@login_required
def add_round_submit():
    course_id = request.form.get("course")
    teebox_id = request.form.get("teebox")
    nine_hole_round = request.form.get("nineHoleRound") == "True"
    score = request.form.get("score", type=int)
    gir = request.form.get("gir", type=int)
    fir = request.form.get("fir", type=int)
    putts = request.form.get("putts", type=int)
    date = request.form.get("date")

    date = handicap_helpers.get_date_from_string(date)

    score_diff = handicap_helpers.get_score_diff(
        teebox_id=teebox_id, score=score, nine_hole_round=nine_hole_round
    )

    new_round = round_queries.create_round(
        course_id=course_id,
        teebox_id=teebox_id,
        score=score,
        score_diff=score_diff,
        nine_hole_round=nine_hole_round,
        fir=fir,
        gir=gir,
        putts=putts,
        date=date,
    )

    old_handicap, new_handicap = handicap_helpers.update_handicap()

    send_email.send_subscribers_message(
        current_user.get_id(), new_round, old_handicap, new_handicap
    )

    return redirect(url_for("viewplayer_bp.index"))


@viewplayer_bp.route("/edit_round/<int:id>", methods=["POST"])
@login_required
def edit_round(id):
    new_score = request.form.get("score", type=int)
    new_gir = request.form.get("gir", type=int)
    new_fir = request.form.get("fir", type=int)
    new_putts = request.form.get("putts", type=int)
    new_date = request.form.get("date")

    should_update_handicap, round = round_queries.update_round(
        round_id=id,
        score=new_score,
        fir=new_fir,
        gir=new_gir,
        putts=new_putts,
        date=new_date,
    )

    if should_update_handicap:
        handicap_helpers.update_handicap(updated_round=round)

    return {
        "handicap": current_user.handicap.handicap_str(),
        "rounds": handicap_helpers.get_included_rounds(
            [r.to_dict() for r in round_queries.get_rounds(sort=True)]
        ),
    }


@viewplayer_bp.route("/delete_round/<int:id>", methods=["POST"])
@login_required
def delete_round(id):
    should_update_handicap = round_queries.delete_round(round_id=id)

    if should_update_handicap:
        handicap_helpers.update_handicap()

    return {
        "handicap": current_user.handicap.handicap_str(),
        "rounds": handicap_helpers.get_included_rounds(
            [r.to_dict() for r in round_queries.get_rounds(sort=True)]
        ),
    }


@viewplayer_bp.route("/view_player/<int:id>", methods=["GET"])
def view_player(id):
    if current_user.is_authenticated and current_user.id == id:
        return redirect(url_for("viewplayer_bp.index"))

    rounds = [
        r.to_dict() for r in round_queries.get_rounds_for_user_id(user_id=id, sort=True)
    ]

    handicap = handicap_queries.get_handicap_for_user_id(user_id=id)
    if handicap:
        handicap = str(handicap)
    else:
        handicap = "No handicap"

    courses = {c.id: c.to_dict() for c in course_queries.get_courses()}
    rounds = handicap_helpers.get_included_rounds(rounds)
    user = user_queries.get_user_by_id(user_id=id)
    return render_template(
        "view_player.html",
        user=user,
        rounds=rounds,
        courses=courses,
        handicap=handicap,
    )
