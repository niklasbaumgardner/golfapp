from flask import url_for
from golfapp import db, login_manager
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
import os
from sqlalchemy_serializer import SerializerMixin
import usaddress


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
        "course_ranking_url",
        "is_admin",
    )

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    is_publicly_visible = db.Column(db.Boolean, nullable=True)
    role = db.Column(db.Integer, nullable=True)

    # ghin_id = db.Column(db.String, nullable=True)

    handicap = db.relationship("Handicap", uselist=False, lazy="joined")

    @property
    def is_admin(self):
        return self.role is not None and self.role > 1

    def url(self):
        return url_for("viewplayer_bp.view_player", id=self.id)

    def course_ranking_url(self):
        return url_for("courseranking_bp.course_ranking", user_id=self.id)

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


class Course(db.Model, SerializerMixin):
    serialize_only = ("id", "name", "address", "address_dict", "teeboxes")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=True)

    teeboxes = db.relationship("CourseTeebox", lazy="joined")

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
    serialize_rules = (
        "edit_round_url",
        "delete_round_url",
        "teebox",
        "course",
    )

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
    nine_hole_round = db.Column(db.Boolean, nullable=True)

    course = db.relationship("Course", lazy="joined")
    teebox = db.relationship("CourseTeebox", lazy="joined")

    def edit_round_url(self):
        return url_for("viewplayer_bp.edit_round", id=self.id)

    def delete_round_url(self):
        return url_for("viewplayer_bp.delete_round", id=self.id)


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


class Theme(db.Model, SerializerMixin):
    serialize_rules = (
        "-id",
        "-user_id",
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    theme = db.Column(db.String, nullable=True)  # default, classic, custom, etc...
    mode = db.Column(db.String, nullable=True)  # light, dark
    primary_color = db.Column(db.String, nullable=True)  # red, blue, green, etc...
    color_contrast = db.Column(db.String, nullable=True)  # web-awesome values
    color_palette = db.Column(db.String, nullable=True)  # web-awesome values


class Subscription(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    subscribed_to = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    subscribers = db.relationship("Subscriber", lazy="joined")


class Subscriber(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    subscribtion_id = db.Column(
        db.Integer, db.ForeignKey("subscription.id"), nullable=False
    )
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)


class CourseRanking(db.Model, SerializerMixin):
    serialize_only = (
        "id",
        "user",
        "course",
        "rating",
        "edit_rating_url",
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    rating = db.Column(db.Float, nullable=True)

    user = db.relationship("User", lazy="joined")
    course = db.relationship("Course", lazy="joined")

    def edit_rating_url(self):
        return url_for("courseranking_bp.edit_rating", id=self.id)


# class GHINRound(db.Model, SerializerMixin):
#     # use my own id. not ghin id
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

#     number_of_holes = db.Column(db.Integer, nullable=False)
#     number_of_played_holes = db.Column(db.Integer, nullable=False)

#     ghin_round_id = db.Column(db.Integer, nullable=False)  # maps to "id"

#     played_at = db.Column(db.Date, nullable=False)

#     course_id = db.Column(db.Integer, nullable=False)
#     course_name = db.Column(db.String, nullable=False)
#     course_rating = db.Column(db.Float, nullable=False)
#     slope_rating = db.Column(db.Float, nullable=False)

#     tee_name = db.Column(db.String, nullable=False)

#     adjusted_gross_score = db.Column(db.Integer, nullable=False)

#     course_handicap = db.Column(db.Integer, nullable=False)

#     pcc = db.Column(db.Float, nullable=False)
#     differential = db.Column(db.Float, nullable=False)
#     unadjusted_differential = db.Column(db.Float, nullable=False)

#     used = db.Column(db.Boolean, nullable=False)


# class GHINHole(db.Model, SerializerMixin):
#     # use my own id. not ghin id
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

#     ghin_hole_id = db.Column(db.Integer, nullable=False)  # maps to "id"

#     adjusted_gross_score = db.Column(db.Integer, nullable=False)
#     raw_score = db.Column(db.Integer, nullable=False)

#     hole_number = db.Column(db.Integer, nullable=False)
#     par = db.Column(db.Integer, nullable=False)

#     putts = db.Column(db.Integer, nullable=False)

#     fairway_hit = db.Column(db.Boolean, nullable=True)
#     drive_accuracy = db.Column(db.Integer, nullable=True)

#     gir_flag = db.Column(db.Boolean, nullable=False)
#     approach_shot_accuracy = db.Column(db.Integer, nullable=True)
