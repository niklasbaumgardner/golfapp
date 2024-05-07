from flask_login import current_user
from golfapp.queries import theme_queries
from flask import Blueprint

context_processor_bp = Blueprint("context_processor_bp", __name__)


@context_processor_bp.app_context_processor
def utility_processor():
    def get_theme():
        if not current_user.is_authenticated:
            return None

        theme = theme_queries.get_theme()
        return theme

    theme = get_theme()

    if theme:
        return dict(theme=theme.color)

    return dict(theme="")
