from flask import url_for
from golfapp.models import User, Course, Round, Handicap, H_User, RRound
from golfapp.extensions import db
import math


def calculate_handicap(rounds, courses):
    count = len(rounds)
    if count <= 3:
        handicap = get_score_diffs(rounds, courses)[0] - 2
    elif count == 4:
        handicap = get_score_diffs(rounds, courses)[0] - 1
    elif count == 5:
        handicap = get_score_diffs(rounds, courses)[0]
    elif count == 6:
        handicap = (sum(get_score_diffs(rounds, courses)[:2]) / 2) - 1
    elif 7 <= count <= 8:
        handicap = sum(get_score_diffs(rounds, courses)[:2]) / 2
    elif 9 <= count <= 11:
        handicap = sum(get_score_diffs(rounds, courses)[:3]) / 3
    elif 12 <= count <= 14:
        handicap = sum(get_score_diffs(rounds, courses)[:4]) / 4
    elif 15 <= count <= 16:
        handicap = sum(get_score_diffs(rounds, courses)[:5]) / 5
    elif 17 <= count <= 18:
        handicap = sum(get_score_diffs(rounds, courses)[:6]) / 6
    elif count == 19:
        handicap = sum(get_score_diffs(rounds, courses)[:7]) / 7
    elif count >= 20:
        handicap = sum(get_score_diffs(rounds, courses)[:8]) / 8

    return round(handicap, 2)


def get_score_diffs(rounds, courses):
    lst = []
    for rnd in rounds:
        course = courses[rnd.course_id]
        score_diff = calculate_score_diff(course.slope, course.rating, rnd.score)
        rnd.score_diff = score_diff
        db.session.commit()
        # print(course.name, score_diff)
        lst.append(score_diff)
    lst.sort()
    return lst


def calculate_score_diff(slope, rating, score):
    return round((113 / slope) * (score - rating - 1), 1)


def assign_handicap(users, handis, include_all=False, stringify=True):
    lst = []
    for user in users:
        handicap = find_handicap(user.id, handis)
        if handicap or include_all:
            if handicap:
                if stringify:
                    handicap = stringify_handicap(handicap.handicap)
                else:
                    handicap = handicap.handicap

            new_user = H_User(
                id=user.id,
                name=user.username,
                handicap=handicap if handicap else "0",
                is_visible=user.is_publicly_visible,
            )
            lst.append(new_user)

    return sort_handicap(lst) if stringify else sorted(lst, key=lambda x: x.username)


def find_handicap(id, handis):
    return next(filter(lambda x: x.user_id == id, handis), None)


def calculate_strokes(course, players):
    course = Course.query.filter_by(id=course).first()
    players = [User.query.filter_by(id=player).first() for player in players]
    handis = [Handicap.query.filter_by(user_id=player.id).first() for player in players]

    h_users = assign_handicap(players, handis, stringify=False)

    return get_strokes(course, h_users), course.name


def get_strokes(course, h_users):
    lst = []
    for user in h_users:
        num_strokes = strokes(course, user.handicap)
        lst.append((user.username, num_strokes))
    return lst


def strokes(course, handi):
    return int(math.ceil(handi * course.slope / 113))


def get_avg_gir(rounds):
    total = 0
    count = 0

    for round_ in rounds:
        if round_.gir:
            total += round_.gir
            count += 1

    return round(total / count, 2) if count else 0


def get_avg_fir(rounds):
    total = 0
    count = 0

    for round_ in rounds:
        if round_.fir:
            total += round_.fir
            count += 1

    return round(total / count, 2) if count else 0


def get_avg_putts(rounds):
    total = 0
    count = 0

    for round_ in rounds:
        if round_.putts:
            total += round_.putts
            count += 1

    avg_putts = 0
    if count:
        ppr = round(total / count, 2)
        avg_putts = f"{ppr} putts. ({round(ppr / 18, 2)} per hole)"

    return avg_putts


def stringify_handicap(handicap):
    if handicap < 0:
        handicap = f"+{str(handicap)[1:]}"
    else:
        handicap = str(handicap)
    return handicap


def sort_handicap(lst):
    for ele in lst:
        ele.handicap = (
            float(ele.handicap)
            if ele.handicap[0] != "+"
            else -1 * float(ele.handicap[1:])
        )

    lst.sort(key=lambda x: x.handicap)

    for ele in lst:
        ele.handicap = stringify_handicap(ele.handicap)

    return lst


def get_included_rounds(rounds):
    num_included = 1
    count = len(rounds)
    if 6 <= count <= 8:
        num_included = 2
    elif 9 <= count <= 11:
        num_included = 3
    elif 12 <= count <= 14:
        num_included = 4
    elif 15 <= count <= 16:
        num_included = 5
    elif 17 <= count <= 18:
        num_included = 6
    elif count == 19:
        num_included = 7
    elif count >= 20:
        num_included = 8

    score_diff_indeces = sorted(
        enumerate(rounds[:20]), key=lambda x: float(x[1].score_diff)
    )[:num_included]

    for index in score_diff_indeces:
        rounds[index[0]] = RRound(rounds[index[0]])

    return rounds


def jsonify_rounds(rounds):
    lst = []

    # TODO:
    # will have to redo round db to change to date

    for r in rounds:
        temp = [
            r.id,
            r.course_id,
            r.score,
            r.score_diff,
            r.fir,
            r.gir,
            r.putts,
            r.date.strftime("%Y-%m-%d"),
            True if type(r) == RRound and r.included else False,
            url_for("home.update_round", id=r.id),
        ]
        lst.append(temp)

    return lst


def jsonify_courses():
    courses_lst = Course.query.all()

    courses = {}

    for c in courses_lst:
        courses[c.id] = {
            "id": c.id,
            "name": c.name,
            "par": c.par,
            "rating": c.rating,
            "slope": c.slope,
        }

    return courses
