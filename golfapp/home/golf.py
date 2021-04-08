


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
        lst.append(score_diff)
    lst.sort()
    return lst



def calculate_score_diff(slope, rating, score):
    return (113 / slope) * (score - rating - 1)
