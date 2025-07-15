from golfapp.models import Theme
from flask_login import current_user
from golfapp import db
from sqlalchemy import insert, select, update


##
## Theme queries
##


def create_theme(
    theme=None, mode=None, primary_color=None, color_contrast=None, color_palette=None
):
    stmt = insert(Theme).values(
        user_id=current_user.id,
        theme=theme or None,
        mode=mode or None,
        primary_color=primary_color or None,
        color_contrast=color_contrast or None,
        color_palette=color_palette or None,
    )
    db.session.execute(stmt)
    db.session.commit()


def get_theme():
    return db.session.scalars(
        select(Theme).where(Theme.user_id == current_user.id).limit(1)
    ).first()


def update_theme(**values):
    stmt = update(Theme).where(Theme.user_id == current_user.id).values(values)
    db.session.execute(stmt)
    db.session.commit()


def set_theme(theme):
    if not current_user.is_authenticated:
        return

    if theme in [
        "default",
        "classic",
        "awesome",
        "mellow",
        "active",
        "brutalist",
        "glossy",
        "matter",
        "playful",
        "premium",
        "tailspin",
    ]:
        theme = theme
    else:
        theme = "classic"

    theme_model = get_theme()

    if theme_model:
        update_theme(theme=theme)
    else:
        create_theme(theme=theme, mode="light")

    return theme


def set_theme_mode(mode):
    if not current_user.is_authenticated:
        return

    mode = "dark" if mode == "dark" else "light"

    theme = get_theme()

    if theme:
        update_theme(mode=mode)
    else:
        create_theme(theme="classic", mode=mode)

    return theme


def set_primary_color(primary_color):
    if not current_user.is_authenticated:
        return

    if primary_color not in [
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "blue",
        "indigo",
        "purple",
        "pink",
        "gray",
    ]:
        primary_color = None

    theme = get_theme()

    if theme:
        update_theme(primary_color=primary_color)
    else:
        create_theme(theme="classic", mode="light", primary_color=primary_color)

    return theme


def set_color_contrast(color_contrast):
    if not current_user.is_authenticated:
        return

    if color_contrast not in [
        "default",
        "classic",
        "awesome",
        "mellow",
        "active",
        "brutalist",
        "glossy",
        "matter",
        "playful",
        "premium",
        "tailspin",
    ]:
        color_contrast = None

    theme = get_theme()

    if theme:
        update_theme(color_contrast=color_contrast)
    else:
        create_theme(theme="classic", mode="light", color_contrast=color_contrast)

    return theme


def set_color_palette(color_palette):
    if not current_user.is_authenticated:
        return

    if color_palette not in [
        "default",
        "anodized",
        "bright",
        "classic",
        "elegant",
        "mild",
        "natural",
        "rudimentary",
        "vogue",
    ]:
        color_palette = None

    theme = get_theme()

    if theme:
        update_theme(color_palette=color_palette)
    else:
        create_theme(theme="classic", mode="light", color_palette=color_palette)

    return theme
