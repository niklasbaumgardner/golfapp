from flask import Blueprint, request
from flask_login import current_user
from golfapp.queries import theme_queries


theme_bp = Blueprint("theme_bp", __name__)


@theme_bp.route("/set_theme", methods=["GET"])
def set_theme():
    if not current_user.is_authenticated:
        return {}

    theme = request.args.get("theme")
    theme = "light" if theme == "light" else "dark"
    theme_queries.set_theme(theme_color=theme)
    return {"success": True}
