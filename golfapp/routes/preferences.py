from flask import Blueprint, render_template, request
from flask_login import login_required
from golfapp.queries import theme_queries

preferences_bp = Blueprint("preferences_bp", __name__)


@preferences_bp.route("/preferences", methods=["GET"])
@login_required
def preferences():
    return render_template("preferences.html")


@preferences_bp.route("/set_primary_color", methods=["GET"])
@login_required
def set_primary_color():
    color = request.args.get("color")
    theme_queries.set_theme(color=color)
    return {"success": True}


@preferences_bp.route("/set_background_color", methods=["GET"])
@login_required
def set_background_color():
    background_color = request.args.get("backgroundColor")
    theme_queries.set_theme(background_color=background_color)
    return {"success": True}
