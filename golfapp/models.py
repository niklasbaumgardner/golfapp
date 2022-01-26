from golfapp.extensions import db, login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class H_User():
    def __init__(self, id, name, handicap):
        self.id = id
        self.name = name
        self.handicap = handicap

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False)
    email = db.Column(db.String(60), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False)
    par = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    slope = db.Column(db.Float, nullable=False)

class Round(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    gir = db.Column(db.Float, nullable=True)
    fir = db.Column(db.Float, nullable=True)
    putts = db.Column(db.Float, nullable=True)
    date = db.Column(db.DateTime, nullable=False)

class Handicap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    handicap = db.Column(db.Float, nullable=False)