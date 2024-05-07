from golfapp.models import Theme
from flask_login import current_user
from golfapp import db


##
## Theme queries
##


def create_theme(theme_color):
    theme = Theme(
        user_id=current_user.id,
        color=theme_color or "",
    )
    db.session.add(theme)
    db.session.commit()
    return theme


def get_theme():
    return Theme.query.filter_by(user_id=current_user.id).first()


def set_theme(theme_color):
    if not current_user.is_authenticated:
        return

    if theme_color is not None and theme_color not in ("", "dark", "light"):
        return

    theme = get_theme()

    if theme:
        if theme_color is not None:
            theme.color = theme_color
            db.session.commit()
    else:
        create_theme(theme_color=theme_color)

    return theme
