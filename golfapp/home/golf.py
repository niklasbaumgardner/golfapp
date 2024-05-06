from flask import url_for
from flask_mail import Message
from flask_login import current_user
from golfapp.models import User, Course, Round, Handicap, H_User, RRound
from golfapp import db
from golfapp.home import queries
from golfapp import mail
import math
import random


GOOD_SARCASTIC_MESSAGES = [
    "Oh wow, congratulations on being able to hit a small ball into a large hole. You must be so proud.",
    "I'm sure winning at golf is really going to impress all the ladies at the retirement home.",
    "I'm so happy for you, now you can add 'golf pro' to your list of career options.",
    "I'm amazed at how well you played, considering how little effort you put into actually practicing.",
    "Well done on your golf game! It's always nice to see someone excel at a sport that's basically just walking and hitting a ball.",
    "Congratulations, you've officially reached the pinnacle of your golfing career. It's all downhill from here.",
    "I'm sure your opponent was really impressed by your incredible skills at hitting a ball with a stick.",
    "Wow, it's almost like you were born to play golf. Maybe you should quit your day job and become a professional golfer.",
    "I heard Tiger Woods called. He's thinking of retiring now that he knows you're on the scene.",
    "I hope you're ready for all the fame and fortune that comes with being a golfing superstar. Don't forget about us little people when you're on the cover of Golf Digest.",
]
BAD_SARCASTIC_MESSAGES = [
    "Congratulations on winning the 'worst golf player of the year' award. You totally deserve it!",
    "I heard the grass on the golf course is really tough to play on. Maybe next time you should bring a lawnmower.",
    "Looks like you had a great time out there, even if the golf ball didn't want to cooperate with you.",
    "I guess it's a good thing that golf isn't a team sport, otherwise you would have let the whole team down.",
    "Well, at least now you have a good excuse for why you're not a professional golfer.",
    "I think you're ready to apply for a job as a golf course landscaper. You clearly have a lot of experience hitting balls into the rough.",
    "Looks like you had a great workout today, what with all the swinging and missing you did out there.",
    "Don't worry, I'm sure you'll do better next time. Or maybe not. Who knows?",
    "I'm sure your opponents were thrilled to have such an easy win against you. It's always nice to boost one's self-esteem, isn't it?",
    "Well, at least you got some fresh air and exercise today. That's something, right?",
]


def assign_handicap(users, handis, include_all=False, stringify=True):
    lst = []
    for user in users:
        handicap = find_handicap(user.id, handis)
        if handicap or include_all:

            new_user = H_User(
                id=user.id,
                name=user.username,
                handicap=handicap if handicap else Handicap(handicap=0),
                is_visible=user.is_publicly_visible,
            )
            lst.append(new_user)

    return sort_handicap(lst) if stringify else sorted(lst, key=lambda x: x.username)


def find_handicap(id, handis):
    return next(filter(lambda x: x.user_id == id, handis), None)


def get_avg_gir(rounds):
    total = 0
    count = 0

    for round_ in rounds:
        if round_.gir:
            total += round_.gir
            count += 1
    if count:
        girs = round(total / count, 2)
        return f"{girs} ({round(100 * girs / 18, 2)}%)"

    return 0


def get_avg_fir(rounds):
    total = 0
    count = 0

    for round_ in rounds:
        if round_.fir:
            total += round_.fir
            count += 1

    if count:
        firs = round(total / count, 2)
        return f"{firs} ({round(100 * firs / 14, 2)}%)"

    return 0


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
    lst.sort(key=lambda x: x.handicap.handicap)

    for ele in lst:
        ele.handicap = str(ele.handicap)

    return lst


def get_dates_for_range(first, last):
    num_day = last - first
    step = num_day // 10

    dates = []
    curr = first
    while curr < last:
        dates.append(curr)
        curr += step

    dates.append(last)

    return dates, step


def get_next_smallest_date_index(rounds, target_date):
    for i, round in enumerate(rounds):
        if round.date > target_date:
            return i - 1
    return len(rounds) - 1


def get_handicap_graph_list():
    rounds = queries.get_rounds(sort=True)
    rounds.reverse()

    first_date = rounds[0].date
    last_date = rounds[-1].date
    dates, step = get_dates_for_range(first_date, last_date)

    dates.pop(0)

    handicaps = []
    for date in dates:
        end_index = get_next_smallest_date_index(rounds, date)
        start_index = 0
        if end_index > 20:
            start_index = end_index - 20

        rounds_in_date_range = rounds[start_index : end_index + 1]
        handicap_for_date = calculate_handicap(rounds_in_date_range)
        handicaps.append(handicap_for_date)

    return [d.strftime("%m/%d/%Y") for d in dates], handicaps


def get_anitcap():
    rounds = queries.get_rounds(sort=True, max_rounds=20)
    anticap = calculate_handicap(rounds=rounds, reverse=True)

    return anticap


def get_averagecap():
    rounds = queries.get_rounds(sort=True, max_rounds=20)
    score_diffs = get_score_diffs(rounds=rounds)
    averagecap = round(sum(score_diffs) / len(score_diffs), 2)

    return averagecap


def jsonify_rounds(rounds):
    lst = []

    # TODO:
    # will have to redo round db to change to date

    for r in rounds:
        temp = [
            r.id,
            r.course_id,
            r.teebox_id,
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


def jsonify_courses(sort=False):
    courses_lst = queries.get_courses(sort=sort)

    courses = {}

    for c in courses_lst:
        teeboxes = jsonify_teeboxes(course_id=c.id)

        courses[c.id] = {
            "id": c.id,
            "name": c.name,
            "teeboxes": teeboxes,
        }

    return courses


def courses_as_dict():
    c_t_joined = queries.get_courses_teeboxes_joined()

    courses = dict()
    for c, t in c_t_joined:
        if c.id in courses:
            courses[c.id]["teeboxes"][t.id] = t.to_dict()
        else:
            c_obj = c.to_dict()

            t_obj = dict()
            t_obj[t.id] = t.to_dict()

            c_obj["teeboxes"] = t_obj

            courses[c.id] = c_obj

    return courses


def jsonify_teeboxes(course_id):
    teeboxes_lst = queries.get_teeboxes_for_course(course_id=course_id)

    teeboxes = {}

    for t in teeboxes_lst:
        teeboxes[t.id] = {
            "id": t.id,
            "course_id": course_id,
            "teebox": t.teebox,
            "par": t.par,
            "rating": t.rating,
            "slope": t.slope,
        }

    return teeboxes


def is_round_in_included(round, included_rounds):
    round_id_set = set()
    for rnd in included_rounds:
        if type(rnd) == RRound:
            round_id_set.add(rnd.id)

    return round.id in round_id_set


def get_handicap_change_message(old_handicap, new_handicap):
    if not old_handicap:
        return f"handicap is now {stringify_handicap(new_handicap)}"
    elif old_handicap == new_handicap:
        return f"handicap remained the same at {stringify_handicap(new_handicap)}"
    elif old_handicap > new_handicap:
        return f"handicap improved from {stringify_handicap(old_handicap)} to {stringify_handicap(new_handicap)}"
    elif old_handicap < new_handicap:
        return f"handicap worsened from {stringify_handicap(old_handicap)} to {stringify_handicap(new_handicap)}"


def get_random_message(new_round, user_id, old_handicap, new_handicap):
    included_rounds = get_included_rounds(
        [r.to_dict() for r in queries.get_rounds(sort=True, max_rounds=20)]
    )
    course = queries.get_course(new_round.course_id)

    index = random.randint(0, 9)

    message = f"""
{current_user.username} shot {new_round.score} at {course.name}.
Their {get_handicap_change_message(old_handicap, new_handicap)}.

View the rest of their rounds at {url_for('home.view_player', id=user_id, _external=True)}

{ GOOD_SARCASTIC_MESSAGES[index] if is_round_in_included(new_round, included_rounds) else BAD_SARCASTIC_MESSAGES[index] }

Please thank ChatGPT for the wonderful message.
"""

    return message


def send_subscribers_message(user_id, new_round, old_handicap, new_handicap):
    subscribers = queries.get_subscribers_for_user_id(user_id=user_id)

    if not subscribers:
        return

    subscribers_emails = [
        queries.get_user(subscriber.user_id).email for subscriber in subscribers
    ]

    msg = Message(
        f"{current_user.username} just added a new round", recipients=subscribers_emails
    )
    msg.body = get_random_message(
        new_round=new_round,
        user_id=user_id,
        old_handicap=old_handicap,
        new_handicap=new_handicap,
    )
    mail.send(msg)
