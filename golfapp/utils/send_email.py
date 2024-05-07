from flask import url_for
from flask_mail import Message
from flask_login import current_user
from golfapp import mail
from golfapp.utils import handicap_helpers
from golfapp.queries import (
    course_queries,
    round_queries,
    subscriber_queries,
    user_queries,
)
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


def send_reset_email(user):
    if not user:
        return

    token = user.get_reset_token()
    msg = Message("Password Reset Request", recipients=[user.email])
    msg.body = f"""To reset your password, visit the following link:
{url_for('auth_bp.password_reset', token=token, _external=True)}
If you did not make this request then please ignore this email and no changes will be made.
"""
    mail.send(msg)


def get_handicap_change_message(old_handicap, new_handicap):
    def handicap_str(self):
        if self.handicap < 0:
            return f"+{str(self.handicap)[1:]}"

        return f"{self.handicap}"

    if not old_handicap:
        return f"handicap is now {handicap_str(new_handicap)}"
    elif old_handicap == new_handicap:
        return f"handicap remained the same at {handicap_str(new_handicap)}"
    elif old_handicap > new_handicap:
        return f"handicap improved from {handicap_str(old_handicap)} to {handicap_str(new_handicap)}"
    elif old_handicap < new_handicap:
        return f"handicap worsened from {handicap_str(old_handicap)} to {handicap_str(new_handicap)}"


def get_random_message(new_round, user_id, old_handicap, new_handicap):
    def is_round_in_included(round, included_rounds):
        for rnd in included_rounds:
            if rnd.id == round["id"]:
                return round["isIncluded"]

        return False

    included_rounds = handicap_helpers.get_included_rounds(
        [r.to_dict() for r in round_queries.get_rounds(sort=True, max_rounds=20)]
    )
    course = course_queries.get_course_by_id(course_id=new_round.course_id)

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
    subscribers = subscriber_queries.get_subscribers_for_user(user_id=user_id)

    if not subscribers:
        return

    subscribers_emails = [
        user_queries.get_user_by_id(subscriber.user_id).email
        for subscriber in subscribers
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
