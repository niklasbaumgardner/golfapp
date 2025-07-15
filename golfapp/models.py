from flask import url_for
from golfapp import db, login_manager
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
import os
from sqlalchemy_serializer import SerializerMixin
import usaddress
from typing import List, Optional
from datetime import date as date_type
from typing_extensions import Annotated
from sqlalchemy.orm import relationship, mapped_column, Mapped
from sqlalchemy import ForeignKey, UniqueConstraint


int_pk = Annotated[int, mapped_column(primary_key=True)]
user_fk = Annotated[int, mapped_column(ForeignKey("user.id"))]


@login_manager.user_loader
def load_user(id):
    return db.session.get(User, int(id))


class User(db.Model, UserMixin, SerializerMixin):
    __tablename__ = "user"

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

    id: Mapped[int_pk]
    username: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]
    is_publicly_visible: Mapped[Optional[bool]]
    role: Mapped[Optional[int]]

    handicap: Mapped["Handicap"] = relationship(
        lazy="joined", viewonly=True, uselist=False
    )

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
    __tablename__ = "course"

    serialize_only = ("id", "name", "address", "address_dict", "teeboxes")

    id: Mapped[int_pk]
    name: Mapped[str]
    address: Mapped[Optional[str]]

    teeboxes: Mapped[List["CourseTeebox"]] = relationship(lazy="joined", viewonly=True)

    @property
    def address_dict(self):
        if self.address:
            parsed = usaddress.parse(self.address)
            return {name: val for val, name in parsed}

        return {}


class CourseTeebox(db.Model, SerializerMixin):
    __tablename__ = "course_teebox"

    id: Mapped[int_pk]
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id"))
    par: Mapped[int]
    teebox: Mapped[str]
    rating: Mapped[float]
    slope: Mapped[float]


class Round(db.Model, SerializerMixin):
    __tablename__ = "round"

    serialize_rules = (
        "edit_round_url",
        "delete_round_url",
        "teebox",
        "course",
    )

    id: Mapped[int_pk]
    user_id: Mapped[user_fk]
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id"))
    teebox_id: Mapped[int] = mapped_column(ForeignKey("course_teebox.id"))
    score: Mapped[int]
    score_diff: Mapped[Optional[float]]
    gir: Mapped[Optional[float]]
    fir: Mapped[Optional[float]]
    putts: Mapped[Optional[float]]
    date: Mapped[date_type]
    nine_hole_round: Mapped[Optional[bool]]

    course: Mapped["Course"] = relationship(lazy="joined", viewonly=True)
    teebox: Mapped["CourseTeebox"] = relationship(lazy="joined", viewonly=True)

    def edit_round_url(self):
        return url_for("viewplayer_bp.edit_round", id=self.id)

    def delete_round_url(self):
        return url_for("viewplayer_bp.delete_round", id=self.id)


class Handicap(db.Model, SerializerMixin):
    __tablename__ = "handicap"

    serialize_only = ("id", "user_id", "handicap", "handicap_str")

    id: Mapped[int_pk]
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), unique=True)
    handicap: Mapped[float]

    def handicap_str(self):
        if self.handicap < 0:
            return f"+{str(self.handicap)[1:]}"

        return f"{self.handicap}"

    def __str__(self) -> str:
        return self.handicap_str()

    def __repr__(self) -> str:
        return self.__str__()


class Theme(db.Model, SerializerMixin):
    __tablename__ = "theme"

    serialize_rules = (
        "-id",
        "-user_id",
    )

    id: Mapped[int_pk]
    user_id: Mapped[user_fk]
    theme: Mapped[Optional[str]]  # default, classic, custom, etc...
    mode: Mapped[Optional[str]]  # light, dark
    primary_color: Mapped[Optional[str]]  # red, blue, green, etc...
    color_contrast: Mapped[Optional[str]]  # web-awesome values
    color_palette: Mapped[Optional[str]]  # web-awesome values


class Subscription(db.Model, SerializerMixin):
    __tablename__ = "subscription"

    id: Mapped[int_pk]
    subscribed_to: Mapped[user_fk]

    subscribers: Mapped[List["Subscriber"]] = relationship(lazy="joined", viewonly=True)


class Subscriber(db.Model, SerializerMixin):
    __tablename__ = "subscriber"

    id: Mapped[int_pk]
    subscribtion_id: Mapped[int] = mapped_column(ForeignKey("subscription.id"))
    user_id: Mapped[user_fk]


class CourseRanking(db.Model, SerializerMixin):
    __tablename__ = "course_ranking"
    __table_args__ = (UniqueConstraint("user_id", "course_id"),)

    serialize_only = (
        "id",
        "user",
        "course",
        "rating",
        "edit_rating_url",
    )

    id: Mapped[int_pk]
    user_id: Mapped[user_fk]
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id"))
    rating: Mapped[Optional[float]]

    user: Mapped["User"] = relationship(lazy="joined", viewonly=True)
    course: Mapped["Course"] = relationship(lazy="joined", viewonly=True)

    def edit_rating_url(self):
        return url_for("courseranking_bp.edit_rating", id=self.id)
