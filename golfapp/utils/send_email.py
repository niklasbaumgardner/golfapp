from flask import url_for
from flask_mail import Message
from golfapp import mail


def send_reset_email(user):
    if not user:
        return

    token = user.get_reset_token()
    msg = Message("Password Reset Request", recipients=[user.email])
    msg.body = f"""To reset your password, visit the following link:
{url_for('auth_bp.password_reset', token=token, _external=True)}
If you did not make this request then please ignore this email and no changes will be made.
"""
    mail.send(msg)
