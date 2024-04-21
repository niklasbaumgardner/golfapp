from golfapp.extensions import db, login_manager
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
import os


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class H_User:
    def __init__(self, id, name, handicap, is_visible):
        self.id = id
        self.username = name
        self.handicap = handicap
        self.is_visible = is_visible


class RRound:
    def __init__(self, round):
        self.id = round.id
        self.user_id = round.user_id
        self.course_id = round.course_id
        self.teebox_id = round.teebox_id
        self.score = round.score
        self.score_diff = round.score_diff
        self.gir = round.gir
        self.fir = round.fir
        self.putts = round.putts
        self.date = round.date
        self.included = True


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(60), unique=True, nullable=False)
    email = db.Column(db.String(60), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    is_publicly_visible = db.Column(db.Boolean, nullable=True)

    def get_reset_token(self):
        s = URLSafeTimedSerializer(os.environ.get("SECRET_KEY"))
        return s.dumps({"user_id": self.id}).decode("utf-8")

    @staticmethod
    def verify_reset_token(token, expire_sec=600):
        s = URLSafeTimedSerializer(os.environ.get("SECRET_KEY"))
        try:
            user_id = s.loads(token, max_age=expire_sec).get("user_id")
        except:
            return None
        return User.query.get(user_id)

    def to_json(self):
        return dict(id=self.id, username=self.username)


class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False)

    def to_json(self):
        return dict(id=self.id, name=self.name)


class CourseTeebox(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    par = db.Column(db.Integer, nullable=False)
    teebox = db.Column(db.String(60), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    slope = db.Column(db.Float, nullable=False)

    def to_json(self):
        return dict(
            id=self.id,
            course_id=self.course_id,
            teebox=self.teebox,
            par=self.par,
            slope=self.slope,
            rating=self.rating,
        )


class Round(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    teebox_id = db.Column(db.Integer, db.ForeignKey("course_teebox.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    score_diff = db.Column(db.Float, nullable=True)
    gir = db.Column(db.Float, nullable=True)
    fir = db.Column(db.Float, nullable=True)
    putts = db.Column(db.Float, nullable=True)
    date = db.Column(db.Date, nullable=False)

    def to_json(self):
        return dict(
            id=self.id,
            user_id=self.user_id,
            course_id=self.course_id,
            teebox_id=self.teebox_id,
            score=self.score,
            score_diff=self.score_diff,
            gir=self.gir,
            fir=self.fir,
            putts=self.putts,
            date=self.date,
        )


class Handicap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    handicap = db.Column(db.Float, nullable=False)


class Theme(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    color = db.Column(db.String, nullable=False)


class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subscribed_to = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def to_json(self):
        return dict(id=self.id, subscribed_to=self.subscribed_to)


class Subscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subscribtion_id = db.Column(
        db.Integer, db.ForeignKey("subscription.id"), nullable=False
    )
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    def to_json(self):
        return dict(
            id=self.id, subscription_id=self.subscribtion_id, user_id=self.user_id
        )


class CourseRanking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    rating = db.Column(db.Float, nullable=True)

    def to_json(self):
        return dict(
            id=self.id,
            user_id=self.user_id,
            course_id=self.course_id,
            rating=self.rating,
        )
