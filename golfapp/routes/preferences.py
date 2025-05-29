from flask import Blueprint, render_template, request
from flask_login import login_required
from golfapp.queries import theme_queries

preferences_bp = Blueprint("preferences_bp", __name__)


@preferences_bp.route("/preferences", methods=["GET"])
@login_required
def preferences():
    return render_template("preferences.html")
