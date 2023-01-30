from re import T
from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.models import User, Course, Round, Handicap, H_User
from golfapp.extensions import db
from golfapp.home import golf
from datetime import datetime

from golfapp.user.auth import login


home = Blueprint("home", __name__)


@home.route("/toggle_user_visibilty", methods=["GET"])
@login_required
def toggle_user_visibilty():
    is_visible = request.args.get("isVisible") == "true"
    print(is_visible)
    user = User.query.filter_by(id=current_user.get_id()).first()
    user.is_publicly_visible = is_visible
    db.session.commit()
    return {"success": True}


@home.route("/", methods=["GET"])
@login_required
def index():
    user = User.query.filter_by(id=current_user.get_id()).first()
    rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
    rounds.sort(key=lambda x: x.date, reverse=True)
    courses = {}
    for round_ in rounds:
        courses[round_.course_id] = Course.query.filter_by(id=round_.course_id).first()
    if len(rounds) > 0:
        handicap = golf.stringify_handicap(
            Handicap.query.filter_by(user_id=current_user.get_id()).first().handicap
        )
    else:
        handicap = "No handicap"
    all_courses = Course.query.all()
    all_courses.sort(key=lambda x: x.name)
    stats = {}
    stats["num_rounds"] = len(rounds)
    stats["avg_score"] = round(sum(map(lambda x: x.score, rounds)) / len(rounds), 2)
    stats["avg_gir"] = golf.get_avg_gir(rounds)
    stats["avg_fir"] = golf.get_avg_fir(rounds)
    stats["avg_putts"] = golf.get_avg_putts(rounds)
    rounds = golf.get_included_rounds(rounds)
    return render_template(
        "index.html",
        rounds=rounds,
        courses=courses,
        all_courses=all_courses,
        handicap=handicap,
        strftime=datetime.strftime,
        stats=stats,
        is_visible=user.is_publicly_visible,
    )


@home.route("/view_players", methods=["GET"])
@login_required
def view_players():
    users = User.query.filter_by(is_publicly_visible=True).all()
    handis = Handicap.query.all()
    h_users = golf.assign_handicap(users, handis)
    return render_template("viewplayers.html", users=h_users)


@home.route("/hijack", methods=["GET", "POST"])
@login_required
def hijack():
    if current_user.id not in set([3, 11]):
        return redirect(url_for("home.index"))

    if request.method == "POST":
        try:
            id = int(request.form.get("user_id"))
            user = User.query.filter_by(id=id).first()
            if user:
                handicap = Handicap.query.filter_by(user_id=user.id).first()
                hcp = float(request.form.get("handicap"))
                if not handicap:
                    handicap = Handicap(user_id=user.id, handicap=hcp)
                    db.session.add(handicap)
                else:
                    handicap.handicap = hcp
                db.session.commit()
                return redirect(url_for("home.index"))
        except:
            users = User.query.all()
            handis = Handicap.query.all()
            h_users = golf.assign_handicap(
                users, handis, include_all=True, stringify=False
            )
            return render_template("hijack.html", users=h_users)

    else:
        users = User.query.all()
        handis = Handicap.query.all()
        h_users = golf.assign_handicap(users, handis, include_all=True, stringify=False)
        return render_template("hijack.html", users=h_users)


@home.route("/calculate_strokes", methods=["GET", "POST"])
def calculate_strokes():

    if request.method == "POST":
        course = request.form.get("course")
        players = request.form.getlist("players")
        # print(course, players)
        players = [int(player) for player in players]
        # print(course, players)
        strokes, course_name = golf.calculate_strokes(course, players)
        strokes.sort(key=lambda x: x[1])
        return render_template("strokes.html", strokes=strokes, course=course_name)

    courses = Course.query.all()
    courses.sort(key=lambda x: x.name)
    users = User.query.all()
    handis = Handicap.query.all()
    h_users = golf.assign_handicap(users, handis)

    return render_template("strokes.html", users=h_users, courses=courses)


@home.route("/add_round", methods=["GET"])
@login_required
def add_round():
    courses = Course.query.all()
    courses.sort(key=lambda x: x.name)
    return render_template("addround.html", courses=courses)


@home.route("/add_round_submit", methods=["POST"])
@login_required
def add_round_submit():
    course_id = request.form["course"]
    score = request.form["score"]
    gir = request.form.get("gir")
    fir = request.form.get("fir")
    # fir = round(float(fir[0]) / float(fir[1]), 2)
    putts = request.form.get("putts")
    date_ = request.form.get("date")
    # print(date_)
    date_ = get_datetime(date_)

    gir = gir if gir else None
    fir = fir if fir else None
    putts = putts if putts else None

    # print(course_id, score, gir, fir, putts, date_)

    new_round = Round(
        user_id=current_user.get_id(),
        course_id=course_id,
        score=score,
        gir=gir,
        fir=fir,
        putts=putts,
        date=date_,
    )
    db.session.add(new_round)
    db.session.commit()

    update_handicap()

    return redirect(url_for("home.index"))


@home.route("/add_course", methods=["GET"])
@login_required
def add_course():
    courses = Course.query.all()
    courses.sort(key=lambda x: x.name)
    return render_template("addcourse.html", courses=courses)


@home.route("/add_course_submit", methods=["POST"])
@login_required
def add_course_submit():
    name = request.form["name"]
    par = request.form["par"]
    rating = request.form["rating"]
    slope = request.form["slope"]

    # print(name, par, rating, slope)

    new_course = Course(name=name, par=par, slope=slope, rating=rating)
    db.session.add(new_course)
    db.session.commit()

    return render_template("addcourse.html")


# @home.route('/index', methods=['GET'])
# @login_required
# def index():
#     rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
#     courses = {}
#     for round_ in rounds:
#         courses[round_.course_id] = Course.query.filter_by(id=round_.course_id).first()
#     if len(rounds) > 0:
#         handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first().handicap
#     else:
#         handicap = "No handicap"
#     all_courses = Course.query.all()
#     all_courses.sort(key=lambda x: x.name)
#     return render_template('viewrounds.html', rounds=rounds, courses=courses, all_courses=all_courses, handicap=handicap, strftime=datetime.strftime)


@home.route("/update_round/<int:id>", methods=["POST"])
@login_required
def update_round(id):
    round = Round.query.filter_by(user_id=current_user.get_id(), id=id).first()
    if round:
        new_score = request.form.get("score")
        new_gir = request.form.get("gir")
        new_fir = request.form.get("fir")
        new_putts = request.form.get("putts")
        new_date = request.form.get("date")
        if new_score:
            round.score = new_score
        if new_date:
            round.date = new_date

        # make these None instead of ''
        new_gir = new_gir if new_gir else None
        new_fir = new_fir if new_fir else None
        new_putts = new_putts if new_putts else None
        # these can be None
        round.gir = new_gir
        round.fir = new_fir
        round.putts = new_putts

        db.session.commit()
        update_handicap()

    return redirect(url_for("home.index"))


@home.route("/delete_round/<int:id>", methods=["POST"])
@login_required
def delete_round(id):
    if id:
        rnd = Round.query.filter_by(id=id).first()
        if rnd:
            db.session.delete(rnd)
            db.session.commit()
            rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
            rounds.sort(key=lambda x: x.date, reverse=True)
            rounds = rounds[:20]
            if len(rounds) < 1:
                user_handicap = Handicap.query.filter_by(
                    user_id=current_user.get_id()
                ).first()
                if user_handicap:
                    user_handicap.handicap = 0
                    db.session.commit()
                else:
                    new_handicap = Handicap(user_id=current_user.get_id(), handicap=0)
                    db.session.add(new_handicap)
                    db.session.commit()
                return redirect(url_for("home.index"))

            update_handicap()
    return redirect(url_for("home.index"))


def update_handicap():
    rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
    rounds.sort(key=lambda x: x.date, reverse=True)
    rounds = rounds[:20]

    courses = {}
    for round_ in rounds:
        courses[round_.course_id] = Course.query.filter_by(id=round_.course_id).first()

    handicap = golf.calculate_handicap(rounds, courses)
    user_handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first()

    if user_handicap:
        user_handicap.handicap = handicap
        db.session.commit()
    else:
        new_handicap = Handicap(user_id=current_user.get_id(), handicap=handicap)
        db.session.add(new_handicap)
        db.session.commit()


def get_datetime(str_date):
    year, month, day = str_date.strip().split("-")

    return datetime(int(year), int(month), int(day))
