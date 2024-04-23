from golfapp.home import queries


def get_users_dict():
    users = queries.get_users()
    return {u.id: u.to_json() for u in users}


def get_users_list():
    users = queries.get_users()
    return [u.to_json() for u in users]


def get_courses_dict():
    return {c.id: c.to_dict() for c in queries.get_courses()}


def get_courses_list():
    return [c.to_dict() for c in queries.get_courses()]


def get_course_teebox_list():
    courses = queries.get_courses()

    courses_and_teeboxes = []
    for c in courses:
        teeboxes = queries.get_teeboxes_for_course(course_id=c.id)
        courses_and_teeboxes.append(
            dict(course=c.to_json(), teeboxes=[t.to_json() for t in teeboxes])
        )
    return courses_and_teeboxes


def get_course_ranking_dict_for_user_id(user_id):
    ranking_data = queries.get_course_rankings_for_user(user_id=user_id)
    return [r.to_json() for r in ranking_data]


def get_all_course_rankings_dict():
    course_rankings = queries.get_all_course_rankings()
    return {cr.id: cr.to_json() for cr in course_rankings}


def get_all_course_rankings_list():
    course_rankings = queries.get_all_course_rankings()
    return [cr.to_json() for cr in course_rankings]


def get_rounds_list():
    rounds = queries.get_rounds(sort=True, reverse_sort=True)
    return [r.to_dict() for r in rounds]
