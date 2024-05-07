from flask import Blueprint, render_template, flash, request, redirect, url_for
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.queries import user_queries
from golfapp.models import User
from golfapp import bcrypt
from golfapp.utils.send_email import send_reset_email

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("viewplayer_bp.index"))

    email = request.args.get("email")
    if email:
        return render_template("login.html", email=email)

    def get_url_for_route(route, args):
        if route == "accept_budget":
            token = args.replace("?token=", "")
            return url_for("sharebudget_bp.accept_budget", token=token)

    email = request.form.get("email")
    password = request.form.get("password")
    remember = request.form.get("remember")

    if email and password:
        user = user_queries.get_user_by_email(email=email)

        if user and bcrypt.check_password_hash(user.password, password):
            remember = True if remember == "True" else False
            login_user(user, remember=remember)
            print(email, "next", request.args.get("next"))
            next_list = request.args.get("next").strip("/").split("/")
            next = next_list[0]
            if next:
                try:
                    if len(next_list) > 1:
                        args = next_list[1]
                    return redirect(get_url_for_route(next, args))
                except:
                    pass
            return redirect(url_for("viewplayer_bp.index"))

        elif user:
            flash("Password was incorrect. Try again", "danger")
            return render_template("login.html", email=email)

        flash("User not found. Please create an acount", "neutral")

    return render_template("login.html", email=email)


@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email = request.form.get("email")
        username = request.form.get("username")
        password1 = request.form.get("password1")
        password2 = request.form.get("password2")

        if not user_queries.is_email_unique(email):
            flash("Email already exists. Please log in", "primary")
            return redirect(url_for("auth_bp.login", email=email))

        if not user_queries.is_username_unique(username):
            flash(
                "Username already exists. Please choose a different username",
                "danger",
            )
            return render_template("signup.html")

        if password1 != password2:
            flash("Passwords don't match. Try again", "warning")
            return render_template("signup.html", email=email)

        user_queries.create_user(email=email, username=username, password=password1)
        flash("Sign up succesful", "success")
        return redirect(url_for("auth_bp.login"))

    return render_template("signup.html")


@auth_bp.route("/password_request", methods=["GET", "POST"])
def password_request():
    if current_user.is_authenticated:
        user = user_queries.get_user_by_id(id=current_user.id)
        token = user.get_reset_token()
        return redirect(url_for("auth_bp.password_reset", token=token))

    if request.method == "POST":
        email = request.form.get("email")
        user = user_queries.get_user_by_email(email=email)
        send_reset_email(user)
        flash(
            "An email has been sent with instructions to reset your password. (Check spam folder)",
            "primary",
        )
        return redirect(url_for("auth_bp.login"))

    return render_template("password_request.html")


@auth_bp.route("/password_reset", methods=["GET", "POST"])
def password_reset():
    token = request.args.get("token")
    if request.method == "POST":
        user = User.verify_reset_token(token)
        if not user:
            flash("That is an invalid or expired token", "danger")
            if current_user.is_authenticated:
                return redirect(url_for("profile_bp.profile"))
            else:
                return redirect(url_for("auth_bp.password_request"))

        password1 = request.form.get("password1")
        password2 = request.form.get("password2")

        if password1 != password2:
            flash("Passwords are not equal. Please try again", "warning")
            return render_template("password_reset.html")

        user_queries.update_user_password(user.id, password=password1)
        flash(
            "Your password has been updated! You are now able to log in",
            "success",
        )
        return redirect(url_for("auth_bp.login"))

    return render_template("password_reset.html")


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth_bp.login"))


@auth_bp.route("/username_unique", methods=["GET"])
def username_unique():
    username = request.args.get("username")

    return {"isUnique": user_queries.is_username_unique(username)}


@auth_bp.route("/email_unique", methods=["GET"])
def email_unique():
    email = request.args.get("email")

    return {"isUnique": user_queries.is_email_unique(email)}
