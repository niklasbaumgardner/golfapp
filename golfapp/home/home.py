from re import T
from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.models import User, Course, Round, Handicap, Theme, CourseTeebox
from golfapp.extensions import db
from golfapp.home import golf, queries
from datetime import datetime

from golfapp.user.auth import login


home = Blueprint("home", __name__)


def is_admin():
    return current_user.id == 3 or current_user.id == 11


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
    page = request.args.get("page", 1, type=int)

    rounds, total, page, num_pages = queries.get_rounds(
        page=page, paginate=True, sort=True
    )
    handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first()
    if handicap:
        handicap = golf.stringify_handicap(handicap.handicap)
    else:
        handicap = "No handicap"

    courses = golf.jsonify_courses()
    rounds = golf.get_included_rounds(rounds)
    rounds = golf.jsonify_rounds(rounds)
    user = queries.get_user(current_user.get_id())
    return render_template(
        "view_player.html",
        user=user,
        rounds=rounds,
        courses=courses,
        handicap=handicap,
        is_visible=True,
        total=total,
        page=page,
        num_pages=num_pages,
        is_me=True,
    )


@home.route("/view_player/<int:id>", methods=["GET"])
def view_player(id):
    page = request.args.get("page", 1, type=int)

    if current_user.is_authenticated and current_user.id == id:
        return redirect(url_for("home.index", page=page))

    rounds, total, page, num_pages = queries.get_rounds_for_user_id(
        user_id=id, page=page, paginate=True, sort=True
    )

    handicap = Handicap.query.filter_by(user_id=id).first()
    if handicap:
        handicap = golf.stringify_handicap(handicap.handicap)
    else:
        handicap = "No handicap"

    courses = golf.jsonify_courses()
    rounds = golf.get_included_rounds(rounds)
    rounds = golf.jsonify_rounds(rounds)
    user = queries.get_user(id)
    return render_template(
        "view_player.html",
        user=user,
        rounds=rounds,
        courses=courses,
        handicap=handicap,
        total=total,
        page=page,
        num_pages=num_pages,
    )


@home.route("/get_page", defaults={"id": None})
@home.route("/get_page/<int:id>")
def get_page(id):
    page = request.args.get("page", -1, type=int)

    if page < 1:
        return {"sucess": False}

    if not id and not current_user.is_authenticated:
        return {"page": page, "rounds": []}
    elif not id:
        id = current_user.id

    rounds, total, page, num_pages = queries.get_rounds_for_user_id(
        user_id=id, page=page, paginate=True, sort=True
    )
    rounds = golf.jsonify_rounds(rounds)
    return {"page": page, "rounds": rounds}


@home.route("/view_players", methods=["GET"])
def view_players():
    users = User.query.filter_by(is_publicly_visible=True).all()
    handis = Handicap.query.all()
    h_users = golf.assign_handicap(users, handis)
    return render_template("viewplayers.html", users=h_users)


@home.route("/course_ranking", defaults={"user_id": None}, methods=["GET"])
@home.route("/course_ranking/<int:user_id>", methods=["GET", "POST"])
def course_ranking(user_id):
    if not user_id and not current_user.is_authenticated:
        return redirect(url_for("auth.login"))

    if request.method == "POST":
        if user_id == current_user.id:
            course_id = request.form.get("course")
            rating = request.form.get("rating")

            course_ranking = queries.get_course_ranking_by_course_and_user(
                course_id=course_id, user_id=current_user.id
            )
            if course_ranking:
                queries.update_course_ranking(
                    course_ranking=course_ranking, rating=rating
                )
            else:
                queries.create_course_ranking(course_id, rating)
            return redirect(url_for("home.course_ranking"))

    if not user_id and current_user.is_authenticated:
        user_id = current_user.id

    is_me = current_user.is_authenticated and user_id == current_user.id
    user = queries.get_user(user_id=user_id)
    return render_template("courseranking.html", user_id=user_id, username=user.username, is_me=is_me)


@home.route("/get_course_ranking_data/<int:user_id>", methods=["GET"])
def get_course_ranking_data(user_id):
    ranking_data = queries.get_course_rankings_for_user(user_id=user_id)
    ranking_data_lst = [r.to_json() for r in ranking_data]
    courses = queries.get_courses()
    courses_lst = [c.to_json() for c in courses]

    return {"ranking_data": ranking_data_lst, "courses": courses_lst}


@home.route("/course_rankings", methods={"GET"})
def course_rankings():
    return render_template("courserankings.html")


@home.route("/get_all_course_ranking_data", methods=["GET"])
def get_all_course_ranking_data():
    users = queries.get_users()
    course_rankings = queries.get_all_course_rankings()
    courses = queries.get_courses()

    u_dict = {u.id: u.to_json() for u in users}
    c_dict = {c.id: c.to_json() for c in courses}
    cr_dict = {cr.id: cr.to_json() for cr in course_rankings}
    return {"users": u_dict, "courses": c_dict, "course_rankings": cr_dict}


@home.route("/hijack", methods=["GET", "POST"])
@login_required
def hijack():
    if not is_admin():
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
        teebox = request.form.get("teebox")
        players = request.form.getlist("players")
        # print(course, players)
        players = [int(player) for player in players]
        # print(course, players)
        strokes, course_name = golf.calculate_strokes(course, teebox, players)
        strokes.sort(key=lambda x: x[1])
        return render_template("strokes.html", strokes=strokes, course=course_name)

    courses = golf.jsonify_courses()
    users = User.query.all()
    handis = Handicap.query.all()
    h_users = golf.assign_handicap(users, handis)

    return render_template("strokes.html", users=h_users, courses=courses)


@home.route("/add_round", methods=["GET"])
@login_required
def add_round():
    courses = queries.get_courses(sort=True)
    return render_template("addround.html", courses=courses)


@home.route("/add_round_submit", methods=["POST"])
@login_required
def add_round_submit():
    course_id = request.form["course"]
    teebox_id = request.form.get("teebox")
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
        teebox_id=teebox_id,
        score=score,
        gir=gir,
        fir=fir,
        putts=putts,
        date=date_,
    )
    db.session.add(new_round)
    db.session.commit()

    update_handicap()

    golf.send_subscribers_message(current_user.get_id(), new_round)

    return redirect(url_for("home.index"))


@home.route("/add_course", methods=["GET"])
@login_required
def add_course():
    courses = queries.get_courses(sort=True)
    courses_and_teeboxes = []
    for c in courses:
        teeboxes = queries.get_teeboxes_for_course(course_id=c.id)
        courses_and_teeboxes.append([c, teeboxes])

    return render_template("addcourse.html", courses=courses_and_teeboxes)


@home.route("/add_course_submit", methods=["POST"])
@login_required
def add_course_submit():
    name = request.form.get("name")
    teebox = request.form.get("teebox")
    par = request.form.get("par")
    rating = request.form.get("rating")
    slope = request.form.get("slope")

    course = queries.get_course_by_name(name=name)
    if course:
        new_teebox = CourseTeebox(
            course_id=course.id, teebox=teebox, par=par, slope=slope, rating=rating
        )
        db.session.add(new_teebox)
        db.session.commit()

    else:
        new_course = Course(name=name)
        db.session.add(new_course)
        db.session.commit()

        print(new_course.id)

        new_teebox = CourseTeebox(
            course_id=new_course.id, teebox=teebox, par=par, slope=slope, rating=rating
        )
        db.session.add(new_teebox)
        db.session.commit()

    return redirect(url_for("home.add_course"))


@home.route("/stats", methods=["GET"])
@login_required
def stats():
    user_handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first()
    if not user_handicap:
        return redirect(url_for("home.index"))

    rounds = queries.get_rounds()

    if len(rounds) == 0:
        return redirect(url_for("home.index"))

    stats = {}
    handicap_rounds = {}

    if len(rounds) > 20:
        newest_rounds = rounds[:20]
    else:
        newest_rounds = rounds

    handicap_rounds["num_rounds"] = len(newest_rounds)
    handicap_rounds["avg_score"] = round(
        sum(map(lambda x: x.score, newest_rounds)) / len(newest_rounds), 2
    )
    handicap_rounds["avg_gir"] = golf.get_avg_gir(newest_rounds)
    handicap_rounds["avg_fir"] = golf.get_avg_fir(newest_rounds)
    handicap_rounds["avg_putts"] = golf.get_avg_putts(newest_rounds)

    if len(rounds) > 20:
        previous_rounds_stats = {}
        previous_rounds = rounds[20:]

        previous_rounds_stats["num_rounds"] = len(previous_rounds)
        previous_rounds_stats["avg_score"] = round(
            sum(map(lambda x: x.score, previous_rounds)) / len(previous_rounds), 2
        )
        previous_rounds_stats["avg_gir"] = golf.get_avg_gir(previous_rounds)
        previous_rounds_stats["avg_fir"] = golf.get_avg_fir(previous_rounds)
        previous_rounds_stats["avg_putts"] = golf.get_avg_putts(previous_rounds)

        stats["previous_rounds_stats"] = previous_rounds_stats

        all_rounds = {}

        all_rounds["num_rounds"] = len(rounds)
        all_rounds["avg_score"] = round(
            sum(map(lambda x: x.score, rounds)) / len(rounds), 2
        )
        all_rounds["avg_gir"] = golf.get_avg_gir(rounds)
        all_rounds["avg_fir"] = golf.get_avg_fir(rounds)
        all_rounds["avg_putts"] = golf.get_avg_putts(rounds)

        stats["all_rounds"] = all_rounds

    stats["handicap_rounds"] = handicap_rounds
    return render_template("stats.html", handicap=user_handicap, stats=stats)


@home.route("/update_round/<int:id>", methods=["POST"])
@login_required
def update_round(id):
    page = request.args.get("page", 1, type=int)

    round = Round.query.filter_by(user_id=current_user.get_id(), id=id).first()
    if round:
        new_score = request.form.get("score", 99, type=float)
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

        course = Course.query.filter_by(id=round.course_id).first()
        new_score_diff = golf.calculate_score_diff(
            course.slope, course.rating, round.score
        )
        round.score_diff = new_score_diff

        db.session.commit()
        update_handicap(updated_round=round)

    return redirect(url_for("home.index", page=page))


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


@home.route("/set_theme", methods=["GET"])
@login_required
def set_theme():
    color = request.args.get("theme")
    color = "dark" if color == "dark" else "light"
    theme = Theme.query.filter_by(user_id=current_user.get_id()).first()
    if theme:
        theme.color = color
        db.session.commit()
    else:
        theme = Theme(user_id=current_user.get_id(), color=color)
        db.session.add(theme)
        db.session.commit()
    return {"success": True}


# @home.route("/test", methods=["GET"])
# @login_required
# def test():
#     courses = Course.query.all()
#     string = ""
#     for c in courses:
#         name = c.name
#         lst = name.split(" - ")
#         if len(lst) == 2:
#             new_name = lst[0]
#             teebox = lst[1]

#             print(new_name, teebox)

#             c.name = new_name
#             c.teebox = teebox

#             db.session.commit()
#         # string += f"{c.id}, {c.name}, {c.rating}, {c.slope}\n"

#     return string


@home.route("/edit_courses", methods=["GET"])
@login_required
def edit_courses():
    if not is_admin():
        return redirect(url_for("home.index"))

    courses = golf.jsonify_courses(sort=True)

    return render_template("editcourse.html", courses=courses)


@home.route("/edit_course/<int:c_id>", methods=["POST"])
@login_required
def edit_course(c_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    new_name = request.form.get("name")

    queries.update_course(
        c_id=c_id,
        name=new_name,
    )

    return redirect(url_for("home.edit_courses"))


@home.route("/delete_course/<int:c_id>", methods=["DELETE"])
@login_required
def delete_course(c_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    rounds = queries.get_rounds_for_course_id(course_id=c_id)
    if len(rounds) > 0:
        return {"success": False, "info": f"{len(rounds)} rounds have this course"}

    teeboxes_rounds_count = 0
    teeboxes = queries.get_teeboxes_for_course(course_id=c_id)
    for t in teeboxes:
        teeboxes_rounds_count += len(queries.get_rounds_by_teebox_id(teebox_id=t.id))

    if teeboxes_rounds_count > 0:
        return {
            "success": False,
            "info": f"{len(rounds)} rounds have a teebox from this course",
        }

    for t in teeboxes:
        queries.delete_teebox(teebox_id=t.id)

    queries.delete_course(course_id=c_id)

    return {"success": True}


@home.route("/edit_teebox/<int:t_id>", methods=["POST"])
@login_required
def edit_teebox(t_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    new_teebox = request.form.get("teebox")
    new_par = request.form.get("par")
    new_slope = request.form.get("slope")
    new_rating = request.form.get("rating")

    queries.update_teebox(
        teebox_id=t_id,
        teebox_name=new_teebox,
        par=new_par,
        slope=new_slope,
        rating=new_rating,
    )

    return redirect(url_for("home.edit_courses"))


@home.route("/delete_teebox/<int:t_id>", methods=["DELETE"])
@login_required
def delete_teebox(t_id):
    if not is_admin():
        return redirect(url_for("home.index"))

    rounds = queries.get_rounds_by_teebox_id(teebox_id=t_id)
    if len(rounds) > 0:
        return {"success": False, "info": f"{len(rounds)} rounds have this teebox"}

    queries.delete_teebox(teebox_id=t_id)

    return {"success": True}


@home.route("/subscribers", methods=["GET"])
@login_required
def subscribers():
    if not is_admin():
        return redirect(url_for("home.index"))

    users = queries.get_users()
    users_map = {}

    subscriptions = []
    no_subscription = []
    for user in users:
        users_map[user.id] = user

        subscription = queries.get_subscription(user.id)
        if not subscription:
            no_subscription.append(user)
            continue
        subscriptions.append(
            [subscription, queries.get_subscribers(subscription_id=subscription.id)]
        )

    return render_template(
        "subscribers.html",
        users=users_map,
        subscriptions=subscriptions,
        no_subscription=no_subscription,
    )


@home.route("/create_subscription", methods=["POST"])
@login_required
def create_subscription():
    if not is_admin():
        return redirect(url_for("home.index"))

    user_id = request.form.get("user_id")
    if user_id:
        queries.create_subscription(user_id=user_id)

    return redirect(url_for("home.subscribers"))


@home.context_processor
def utility_processor():
    def get_theme():
        if current_user.is_authenticated:
            theme = Theme.query.filter_by(user_id=current_user.get_id()).first()
            if theme:
                return theme.color
        return ""

    return dict(theme=get_theme())


@home.context_processor
def utility_processor():
    return dict(str=str)


def update_handicap(updated_round=None):
    rounds = queries.get_rounds(sort=True, max_rounds=20)

    if updated_round and updated_round not in rounds:
        return

    handicap = golf.calculate_handicap(rounds)
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
