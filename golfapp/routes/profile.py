from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import current_user, login_required
from golfapp.queries import user_queries

profile_bp = Blueprint("profile_bp", __name__)


@profile_bp.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")

        user_queries.update_user(
            user_id=current_user.id, email=email, username=username
        )

        return redirect(url_for("profile_bp.profile"))

    return render_template(
        "profile.html", username=current_user.username, email=current_user.email
    )
