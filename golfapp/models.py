from flask import url_for
from golfapp import db, login_manager
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
import os
from sqlalchemy_serializer import SerializerMixin
import usaddress
import json


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin, SerializerMixin):
    serialize_only = (
        "id",
        "username",
        "email",
        "is_publicly_visible",
        "handicap",
        "url",
    )

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    is_publicly_visible = db.Column(db.Boolean, nullable=True)
    handicap = db.relationship("Handicap", uselist=False)

    def url(self):
        return url_for("viewplayer_bp.view_player", id=self.id)

    def get_reset_token(self):
        s = URLSafeTimedSerializer(os.environ.get("SECRET_KEY"))
        return s.dumps({"user_id": self.id})

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


class Course(db.Model, SerializerMixin):
    serialize_only = ("id", "name", "address", "address_dict", "teeboxes")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=True)

    teeboxes = db.relationship("CourseTeebox")

    @property
    def address_dict(self):
        if self.address:
            parsed = usaddress.parse(self.address)
            return {name: val for val, name in parsed}

        return {}


class CourseTeebox(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    par = db.Column(db.Integer, nullable=False)
    teebox = db.Column(db.String, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    slope = db.Column(db.Float, nullable=False)


class Round(db.Model, SerializerMixin):
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


class Handicap(db.Model, SerializerMixin):
    serialize_only = ("id", "user_id", "handicap", "handicap_str")

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    handicap = db.Column(db.Float, nullable=False)

    def handicap_str(self):
        if self.handicap < 0:
            return f"+{str(self.handicap)[1:]}"

        return f"{self.handicap}"

    def __str__(self) -> str:
        return self.handicap_str()

    def __repr__(self) -> str:
        return self.__str__()


class Theme(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    color = db.Column(db.String, nullable=False)


class Subscription(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    subscribed_to = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    subscribers = db.relationship("Subscriber")


class Subscriber(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    subscribtion_id = db.Column(
        db.Integer, db.ForeignKey("subscription.id"), nullable=False
    )
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


class CourseRanking(db.Model, SerializerMixin):
    serialize_only = ("id", "user", "course", "rating")

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    rating = db.Column(db.Float, nullable=True)
    user = db.relationship("User")
    course = db.relationship("Course")
