from flask import url_for
from flask_mail import Message
from flask_login import current_user
from golfapp.models import User, Course, Round, Handicap, H_User, RRound
from golfapp.extensions import db
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


def calculate_handicap(rounds):
    count = len(rounds)
    if count <= 3:
        handicap = get_score_diffs(rounds)[0] - 2
    elif count == 4:
        handicap = get_score_diffs(rounds)[0] - 1
    elif count == 5:
        handicap = get_score_diffs(rounds)[0]
    elif count == 6:
        handicap = (sum(get_score_diffs(rounds)[:2]) / 2) - 1
    elif 7 <= count <= 8:
        handicap = sum(get_score_diffs(rounds)[:2]) / 2
    elif 9 <= count <= 11:
        handicap = sum(get_score_diffs(rounds)[:3]) / 3
    elif 12 <= count <= 14:
        handicap = sum(get_score_diffs(rounds)[:4]) / 4
    elif 15 <= count <= 16:
        handicap = sum(get_score_diffs(rounds)[:5]) / 5
    elif 17 <= count <= 18:
        handicap = sum(get_score_diffs(rounds)[:6]) / 6
    elif count == 19:
        handicap = sum(get_score_diffs(rounds)[:7]) / 7
    elif count >= 20:
        handicap = sum(get_score_diffs(rounds)[:8]) / 8

    return round(handicap, 2)


def get_score_diffs(rounds):
    courses = {}
    lst = []
    for rnd in rounds:
        course = courses.get(rnd.course_id)
        if not course:
            course = Course.query.filter_by(id=rnd.course_id).first()
            courses[rnd.course_id] = course
        new_score_diff = calculate_score_diff(course.slope, course.rating, rnd.score)
        if rnd.score_diff != new_score_diff:
            rnd.score_diff = new_score_diff
            db.session.commit()
        # print(course.name, score_diff)
        lst.append(new_score_diff)
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
    return int(math.ceil(handi * (course.slope / 113) + (course.rating - course.par)))


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
            "teebox": c.teebox,
            "par": c.par,
            "rating": c.rating,
            "slope": c.slope,
        }

    return courses


def is_round_in_included(round, included_rounds):
    round_id_set = set()
    for rnd in included_rounds:
        if type(rnd) == RRound:
            round_id_set.add(rnd.id)

    return round.id in round_id_set


def get_random_message(new_round, user_id):
    included_rounds = get_included_rounds(queries.get_rounds(sort=True, max_rounds=20))
    course = queries.get_course(new_round.course_id)

    index = random.randint(0, 9)

    message = f"""
{current_user.username} shot {new_round.score} at {course.name}.

View the rest of thier rounds at {url_for('home.view_player', id=user_id, _external=True)}

{ GOOD_SARCASTIC_MESSAGES[index] if is_round_in_included(new_round, included_rounds) else BAD_SARCASTIC_MESSAGES[index] }

Please thank ChatGPT for the wonderful message.
"""

    return message


def send_subscribers_message(user_id, new_round):
    subscribers = queries.get_subscribers(user_id=user_id)
    print(subscribers)

    if not subscribers:
        return

    subscribers_emails = [
        queries.get_user(subscriber.user_id).email for subscriber in subscribers
    ]

    msg = Message(
        f"{current_user.username} just added a new round", recipients=subscribers_emails
    )
    msg.body = get_random_message(new_round=new_round, user_id=user_id)
    mail.send(msg)
