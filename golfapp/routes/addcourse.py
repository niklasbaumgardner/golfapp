from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import login_required
from golfapp.queries import course_queries


addcourse_bp = Blueprint("addcourse_bp", __name__)


@addcourse_bp.route("/add_course", methods=["GET", "POST"])
@login_required
def add_course():
    if request.method == "POST":
        name = request.form.get("name")
        teebox = request.form.get("teebox")
        par = request.form.get("par")
        rating = request.form.get("rating")
        slope = request.form.get("slope")

        course_queries.add_course(
            name=name, teebox=teebox, par=par, rating=rating, slope=slope
        )

        return redirect(url_for("addcourse_bp.add_course"))

    courses = [c.to_dict() for c in course_queries.get_courses()]
    return render_template("addcourse.html", courses=courses)
