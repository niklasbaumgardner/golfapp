from golfapp.queries import (
    course_queries,
    handicap_queries,
    round_queries,
    user_queries,
)
from flask_login import current_user
from datetime import date


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
        enumerate(rounds[:20]), key=lambda x: float(x[1]["score_diff"])
    )[:num_included]

    for index in score_diff_indeces:
        rounds[index[0]]["isIncluded"] = True

    return rounds


def calculate_strokes(course_id, teebox_id, players):
    course = course_queries.get_course_by_id(course_id=course_id)
    teebox = [t for t in course.teeboxes if t.id == teebox_id][0]
    players = [user_queries.get_user_by_id(user_id=id) for id in players]

    return (
        get_strokes(teebox, players),
        f"{course.name} - {teebox.teebox} ({teebox.rating} / {teebox.slope})",
    )


def get_strokes(teebox, players):
    lst = []
    for user in players:
        num_strokes = strokes(teebox, user.handicap.handicap)
        lst.append((user.username, num_strokes))
    return lst


def strokes(teebox, handi):
    return int(round(handi * (teebox.slope / 113) + (teebox.rating - teebox.par)))


def calculate_score_diff(slope, rating, score):
    return round((113 / slope) * (score - rating - 1), 1)


def get_score_diffs(rounds, reverse=False):
    teeboxes = {}
    lst = []
    for rnd in rounds:
        teebox = teeboxes.get(rnd.teebox_id)
        if not teebox:
            teebox = course_queries.get_teebox_by_id(rnd.teebox_id)
            teeboxes[rnd.teebox_id] = teebox
        new_score_diff = calculate_score_diff(teebox.slope, teebox.rating, rnd.score)
        lst.append(new_score_diff)
    lst.sort()
    if reverse:
        lst.reverse()
    return lst


def calculate_handicap(rounds, reverse=False):
    count = len(rounds)
    score_diffs = get_score_diffs(rounds, reverse)

    if count <= 3:
        handicap = score_diffs[0] - 2
    elif count == 4:
        handicap = score_diffs[0] - 1
    elif count == 5:
        handicap = score_diffs[0]
    elif count == 6:
        handicap = (sum(score_diffs[:2]) / 2) - 1
    elif 7 <= count <= 8:
        handicap = sum(score_diffs[:2]) / 2
    elif 9 <= count <= 11:
        handicap = sum(score_diffs[:3]) / 3
    elif 12 <= count <= 14:
        handicap = sum(score_diffs[:4]) / 4
    elif 15 <= count <= 16:
        handicap = sum(score_diffs[:5]) / 5
    elif 17 <= count <= 18:
        handicap = sum(score_diffs[:6]) / 6
    elif count == 19:
        handicap = sum(score_diffs[:7]) / 7
    elif count >= 20:
        handicap = sum(score_diffs[:8]) / 8

    return round(handicap, 2)


def update_handicap(updated_round=None):
    rounds = round_queries.get_rounds(sort=True, max_rounds=20)

    if updated_round and updated_round not in rounds:
        return

    handicap = calculate_handicap(rounds)
    user_handicap = current_user.handicap

    old_handicap = None

    if user_handicap:
        old_handicap = user_handicap.handicap
        handicap_queries.update_handicap(handicap_diff=handicap)
    else:
        handicap_queries.create_handicap(handicap_diff=handicap)

    return old_handicap, handicap


def get_date_from_string(str_date):
    if not str_date:
        return None

    year, month, day = str_date.strip().split("-")

    return date(int(year), int(month), int(day))
