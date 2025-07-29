from flask import url_for
from flask_mail import Message
from flask_login import current_user
from golfapp import app, mail
from golfapp.queries import (
    subscriber_queries,
    user_queries,
)
from threading import Thread


def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)


def send_reset_email(user):
    if not user:
        return

    token = user.get_reset_token()
    msg = Message("Password Reset Request", recipients=[user.email])
    msg.body = f"""To reset your password, visit the following link:
{url_for("auth_bp.password_reset", token=token, _external=True)}
If you did not make this request then please ignore this email and no changes will be made.
"""
    mail.send(msg)


def send_new_course_email(course, user_id):
    msg = Message("New Course Added", recipients=["niklasbaumgardner@gmail.com"])
    msg.body = f"A new course has been added by user id {user_id}. {course.to_dict()}"
    mail.send(msg)


def get_handicap_change_message(old_handicap, new_handicap):
    def handicap_str(handicap):
        if handicap < 0:
            return f"+{str(handicap)[1:]}"

        return f"{handicap}"

    if not old_handicap:
        return f"handicap is now {handicap_str(new_handicap)}"
    elif old_handicap == new_handicap:
        return f"handicap remained the same at {handicap_str(new_handicap)}"
    elif old_handicap > new_handicap:
        return f"handicap improved from {handicap_str(old_handicap)} to {handicap_str(new_handicap)}"
    elif old_handicap < new_handicap:
        return f"handicap worsened from {handicap_str(old_handicap)} to {handicap_str(new_handicap)}"


def send_subscribers_message(old_handicap, new_handicap, round_dict):
    subscribers = subscriber_queries.get_subscribers_for_user(user_id=current_user.id)

    if not subscribers:
        return

    subscribers_emails = [
        user_queries.get_user_by_id(subscriber.user_id).email
        for subscriber in subscribers
    ]

    content = f"""
{current_user.username} shot {round_dict["score"]} at {round_dict["course_name"]} on {round_dict["date"]}.
Their {get_handicap_change_message(old_handicap, new_handicap)}.

View all of their rounds at {url_for("viewplayer_bp.view_player", id=current_user.id, _external=True)}
"""

    try:
        for email in subscribers_emails:
            send_email_to_subscriber(send_to_email=email, content=content)

    except Exception as e:
        print(e)


def send_email_to_subscriber(send_to_email, content):
    msg = Message(
        f"{current_user.username} just added a new round",
        recipients=[send_to_email],
    )
    msg.body = content

    Thread(target=send_async_email, args=(app, msg)).start()
