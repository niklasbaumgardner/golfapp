from golfapp.queries import course_queries, user_queries


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


def calculate_strokes(course, teebox, players):
    course = course_queries.get_course_by_id(course_id=course)
    players = [user_queries.get_user_by_id(user_id=id) for id in players]
    print(course, course.teeboxes, players, players[0].handicap)
    # handis = [Handicap.query.filter_by(user_id=player.id).first() for player in players]

    # h_users = assign_handicap(players, handis, stringify=False)

    return get_strokes(teebox, players), course.name


def get_strokes(teebox, h_users):
    lst = []
    for user in h_users:
        num_strokes = strokes(teebox, user.handicap.handicap)
        lst.append((user.username, num_strokes))
    return lst


def strokes(teebox, handi):
    return int(round(handi * (teebox.slope / 113) + (teebox.rating - teebox.par)))
