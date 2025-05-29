from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import login_required
from golfapp.queries import course_queries
from golfapp.utils import send_email


addcourse_bp = Blueprint("addcourse_bp", __name__)


@addcourse_bp.route("/add_course", methods=["GET", "POST"])
@login_required
def add_course():
    if request.method == "POST":
        name = request.form.get("name")
        teebox = request.form.get("teebox")
        par = request.form.get("par", type=int)
        rating = request.form.get("rating", type=float)
        slope = request.form.get("slope", type=float)

        name = name.strip()
        teebox = teebox.strip()

        course = course_queries.add_course(
            name=name, teebox=teebox, par=par, rating=rating, slope=slope
        )

        send_email.send_new_course_email(course=course, user_id=current_user.id)

        return redirect(url_for("addcourse_bp.add_course"))

    courses = [c.to_dict() for c in course_queries.get_courses()]
    return render_template("addcourse.html", courses=courses)


@addcourse_bp.post("/add_teebox")
@login_required
def add_teebox():
    course_id = request.form.get("course", type=int)
    teebox = request.form.get("teebox")
    par = request.form.get("par", type=int)
    rating = request.form.get("rating", type=float)
    slope = request.form.get("slope", type=float)

    teebox = teebox.strip()

    course_queries.create_teebox(
        course_id=course_id, teebox=teebox, par=par, rating=rating, slope=slope
    )

    send_email.send_new_course_email(
        course=course_queries.get_course_by_id(course_id=course_id),
        user_id=current_user.id,
    )

    return redirect(url_for("addcourse_bp.add_course"))
