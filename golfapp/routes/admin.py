from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user, login_required
from golfapp.queries import (
    course_queries,
    courseranking_queries,
    handicap_queries,
    round_queries,
    subscriber_queries,
    user_queries,
)


admin_bp = Blueprint("admin_bp", __name__)


def is_admin():
    return current_user.id == 3 or current_user.id == 11


@admin_bp.route("/hijack", methods=["GET", "POST"])
@login_required
def hijack():
    if not is_admin():
        return redirect(url_for("home.index"))

    if request.method == "POST":

        user_id = int(request.form.get("user_id"))
        hcp = float(request.form.get("handicap"))
        handicap_queries.create_or_update_handicap(user_id=user_id, handicap_diff=hcp)

        return redirect(url_for("admin_bp.hijack"))

    users = [u.to_dict() for u in user_queries.get_users()]
    users.sort(key=lambda u: u["handicap"]["handicap"] if u["handicap"] else 999)
    return render_template("hijack.html", users=users)


@admin_bp.route("/edit_courses", methods=["GET"])
@login_required
def edit_courses():
    if not is_admin():
        return redirect(url_for("home.index"))

    courses = course_queries.get_courses(sort=True)

    return render_template("editcourse.html", courses=courses)


@admin_bp.route("/edit_course/<int:c_id>", methods=["POST"])
@login_required
def edit_course(c_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    new_name = request.form.get("name")
    course_queries.update_course(course_id=c_id, name=new_name)

    return redirect(url_for("admin_bp.edit_courses"))


@admin_bp.post("/dedup_course")
@login_required
def dedup_course():
    if not is_admin():
        return redirect(url_for("home.index"))

    duplicate_course_id = request.form.get("duplicate")
    keep_course_id = request.form.get("keep")

    course_queries.deduplicate_course(
        duplicate_course_id=duplicate_course_id, keep_course_id=keep_course_id
    )

    return redirect(url_for("admin_bp.edit_courses"))


@admin_bp.route("/delete_course/<int:c_id>", methods=["DELETE"])
@login_required
def delete_course(c_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    rounds = round_queries.get_rounds_by_course_id(course_id=c_id)
    if len(rounds) > 0:
        return {"success": False, "info": f"{len(rounds)} rounds have this course"}

    teeboxes_rounds_count = 0
    teeboxes = course_queries.get_teeboxes_by_course_id(course_id=c_id)
    for t in teeboxes:
        teeboxes_rounds_count += len(
            round_queries.get_rounds_by_teebox_id(teebox_id=t.id)
        )

    if teeboxes_rounds_count > 0:
        return {
            "success": False,
            "info": f"{len(rounds)} rounds have a teebox from this course",
        }

    course_rankings = courseranking_queries.get_course_rankings_by_course_id(
        course_id=c_id
    )
    if len(course_rankings) > 0:
        return {
            "success": False,
            "info": f"{len(course_rankings)} course rankings have this course",
        }

    for t in teeboxes:
        course_queries.delete_teebox(teebox_id=t.id)

    course_queries.delete_course(course_id=c_id)

    return {"success": True}


@admin_bp.route("/edit_teebox/<int:t_id>", methods=["POST"])
@login_required
def edit_teebox(t_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    new_teebox = request.form.get("teebox")
    new_par = request.form.get("par")
    new_slope = request.form.get("slope")
    new_rating = request.form.get("rating")

    course_queries.update_teebox(
        teebox_id=t_id,
        name=new_teebox,
        par=new_par,
        rating=new_rating,
        slope=new_slope,
    )

    return redirect(url_for("admin_bp.edit_courses"))


@admin_bp.route("/delete_teebox/<int:t_id>", methods=["DELETE"])
@login_required
def delete_teebox(t_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    #     rounds = queries.get_rounds_by_teebox_id(teebox_id=t_id)
    #     if len(rounds) > 0:
    #         return {"success": False, "info": f"{len(rounds)} rounds have this teebox"}

    #     queries.delete_teebox(teebox_id=t_id)

    return {"success": True}


@admin_bp.route("/subscribers", methods=["GET"])
@login_required
def subscribers():
    if not is_admin():
        return redirect(url_for("home.index"))

    users = user_queries.get_users()

    subs = {}
    for u in users:
        s = subscriber_queries.get_subscription_for_user(user_id=u.id)
        if s:
            subs[u.id] = s.to_dict()

    users = {u.id: u.to_dict() for u in user_queries.get_users()}

    return render_template("subscribers.html", users=users, subs=subs)


@admin_bp.route("/create_subscription", methods=["POST"])
@login_required
def create_subscription():
    if not is_admin():
        return redirect(url_for("home.index"))

    user_id = request.form.get("user_id")
    subscriber_queries.create_subscription_for_user(user_id=user_id)

    return redirect(url_for("admin_bp.subscribers"))


@admin_bp.route("/create_subscriber/<int:subscription_id>", methods=["POST"])
@login_required
def create_subscriber(subscription_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    user_id = request.form.get("user_id")
    subscriber_queries.create_subscriber_for_subscription(
        subscribtion_id=subscription_id, user_id=user_id
    )

    return redirect(url_for("admin_bp.subscribers"))
