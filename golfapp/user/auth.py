from flask import Blueprint, render_template, flash, request, redirect, url_for
from flask_login import login_user, current_user, logout_user, login_required
from flask_mail import Message
from golfapp.user import queries
from golfapp.models import User, Theme
from golfapp import mail
from golfapp import bcrypt

auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home.index"))

    email = request.args.get("email")
    if email:
        return render_template("login.html", email=email)

    email = request.form.get("email")
    password = request.form.get("password")
    remember = request.form.get("remember")

    if email and password:
        user = queries.getUserByEmail(email=email)

        if user and bcrypt.check_password_hash(user.password, password):
            remember = True if remember == "True" else False
            login_user(user, remember=remember)
            print(email, "next", request.args.get("next"))
            next = request.args.get("next").replace("/", "", 1)
            if next:
                try:
                    return redirect(url_for(f"home.{next}"))
                except:
                    try:
                        return redirect(url_for(f"auth.{next}"))
                    except:
                        pass
            return redirect(url_for("home.index"))

        elif user:
            flash("Password was incorrect. Try again", "alert-primary")
            return render_template("login.html", email=email)

        flash("User not found. Please create an acount", "alert-primary")

    return render_template("login.html", email=email)


@auth.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email = request.form.get("email")
        username = request.form.get("username")
        password1 = request.form.get("password1")
        password2 = request.form.get("password2")

        if not queries.is_email_unique(email):
            flash("Email already exists. Please log in", "alert-primary")
            return redirect(url_for("auth.login", email=email))

        if not queries.is_username_unique(username):
            flash(
                "Username already exists. Please choose a different username",
                "alert-primary",
            )
            return render_template("signup.html")

        if password1 != password2:
            flash("Passwords don't match. Try again", "alert-primary")
            return render_template("signup.html", email=email)

        queries.createUser(email=email, username=username, password=password1)
        flash("Sign up succesful", "alert-primary")
        return redirect(url_for("auth.login"))

    return render_template("signup.html")


@auth.route("/password_request", methods=["GET", "POST"])
def password_request():
    if current_user.is_authenticated:
        user = queries.getUserById(id=current_user.get_id())
        token = user.get_reset_token()
        return redirect(url_for("auth.password_reset", token=token))

    if request.method == "POST":
        email = request.form.get("email")
        user = queries.getUserByEmail(email=email)
        send_reset_email(user)
        flash(
            "An email has been sent with instructions to reset your password. (Check spam folder)",
            "alert-primary",
        )
        return redirect(url_for("auth.login"))

    return render_template("password_request.html")


@auth.route("/password_reset", methods=["GET", "POST"])
def password_reset():
    token = request.args.get("token")
    print(token)
    if request.method == "POST":
        user = User.verify_reset_token(token)
        if not user:
            flash("That is an invalid or expired token", "alert-primary")

        password1 = request.form.get("password1")
        password2 = request.form.get("password2")

        if password1 != password2:
            flash("Passwords are not equal. Please try again")
            return render_template("password_reset.html")

        queries.updateUserPassword(user.id, password=password1)
        flash(
            "Your password has been updated! You are now able to log in",
            "alert-primary",
        )
        return redirect(url_for("auth.login"))

    return render_template("password_reset.html")


@auth.route("/profile", methods=["GET", "POST"])
@login_required
def profile():
    user = User.query.filter_by(id=current_user.get_id()).first()
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")

        queries.updateUser(id=user.id, email=email, username=username)

        return redirect(url_for("auth.profile"))
    return render_template("profile.html", username=user.username, email=user.email)


@auth.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))


@auth.route("/username_unique", methods=["GET"])
def username_unique():
    username = request.args.get("username")

    return {"isUnique": queries.is_username_unique(username)}


@auth.route("/email_unique", methods=["GET"])
def email_unique():
    email = request.args.get("email")

    return {"isUnique": queries.is_email_unique(email)}


@auth.context_processor
def utility_processor():
    def get_theme():
        if current_user.is_authenticated:
            theme = Theme.query.filter_by(user_id=current_user.get_id()).first()
            if theme:
                return theme.color
        return ""
    return dict(theme=get_theme())


def send_reset_email(user):
    if not user:
        return

    token = user.get_reset_token()
    msg = Message("Password Reset Request", recipients=[user.email])
    msg.body = f"""To reset your password, visit the following link:
{url_for('auth.password_reset', token=token, _external=True)}
If you did not make this request then please ignore this email and no changes will be made.
"""
    mail.send(msg)
