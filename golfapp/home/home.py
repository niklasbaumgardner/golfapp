
from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.models import User, Course, Round, Handicap, H_User
from golfapp.extensions import db
from golfapp.home import golf

# app = Flask(__name__)

home = Blueprint('home', __name__)
# mail = Mail(home)

@home.route('/', methods=["GET"])
def index():
    users = User.query.all()
    handis = Handicap.query.all()
    h_users = golf.assign_handicap(users, handis)
    return render_template('index.html', users=h_users)


@home.route('/calculate_strokes', methods=["GET", "POST"])
def calculate_strokes():
    
    if request.method == 'POST':
        course = request.form.get('course')
        players = request.form.getlist('players')
        # print(course, players)
        players = [ int(player) for player in players ]
        print(course, players)
        strokes, course_name = golf.calculate_strokes(course, players)
        return render_template('strokes.html', strokes=strokes, course=course_name)


    courses = Course.query.all()
    courses.sort(key=lambda x: x.name)
    users = User.query.all()
    return render_template('strokes.html', users=users, courses=courses)



@home.route('/add_round', methods=['GET'])
@login_required
def add_round():
    courses = Course.query.all()
    courses.sort(key=lambda x: x.name)
    return render_template('addround.html', courses=courses)

@home.route('/add_round_submit', methods=['POST'])
@login_required
def add_round_submit():
    course_id = request.form['course']
    score = request.form['score']

    new_round = Round(user_id=current_user.get_id(), course_id=course_id, score=score)
    db.session.add(new_round)
    db.session.commit()

    # calc handicap
    rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
    courses = {}
    for round_ in rounds:
        courses[round_.course_id] = Course.query.filter_by(id=round_.course_id).first()
    
    handicap = golf.calculate_handicap(rounds, courses)
    user_handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first()
    if user_handicap:
        user_handicap.handicap = handicap
        db.session.commit()
    else:
        new_handicap = Handicap(user_id=current_user.get_id(), handicap=handicap)
        db.session.add(new_handicap)
        db.session.commit()


    return redirect(url_for('home.view_rounds'))

@home.route('/add_course', methods=['GET'])
@login_required
def add_course():
    return render_template('addcourse.html')

@home.route('/add_course_submit', methods=['POST'])
@login_required
def add_course_submit():
    name = request.form['name']
    par = request.form['par']
    rating = request.form['rating']
    slope = request.form['slope']

    print(name, par, rating, slope)

    new_course = Course(name=name, par=par, slope=slope, rating=rating)
    db.session.add(new_course)
    db.session.commit()


    return render_template('addcourse.html')


@home.route('/view_rounds', methods=['GET'])
@login_required
def view_rounds():
    rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
    courses = {}
    for round_ in rounds:
        # temp = Course.query.filter_by(id=round_.course_id).first()
        # courses[round_.course_id] = (temp.name, temp.par)
        courses[round_.course_id] = Course.query.filter_by(id=round_.course_id).first()
    if len(rounds) > 0:
        handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first().handicap
    else:
        handicap = "No handicap"
    return render_template('viewrounds.html', rounds=rounds, courses=courses, handicap=handicap)

@home.route('/delete_round/<int:id>')
@login_required
def delete_round(id):
    if id:
        rnd = Round.query.filter_by(id=id).first()
        if rnd:
            db.session.delete(rnd)
            db.session.commit()
            rounds = Round.query.filter_by(user_id=current_user.get_id()).all()
            if len(rounds) < 1:
                user_handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first()
                if user_handicap:
                    user_handicap.handicap = 0
                    db.session.commit()
                else:
                    new_handicap = Handicap(user_id=current_user.get_id(), handicap=0)
                    db.session.add(new_handicap)
                    db.session.commit()
                return redirect(url_for('home.view_rounds'))
            courses = {}
            for round_ in rounds:
                courses[round_.course_id] = Course.query.filter_by(id=round_.course_id).first()
            
            handicap = golf.calculate_handicap(rounds, courses)
            user_handicap = Handicap.query.filter_by(user_id=current_user.get_id()).first()
            if user_handicap:
                user_handicap.handicap = handicap
                db.session.commit()
            else:
                new_handicap = Handicap(user_id=current_user.get_id(), handicap=handicap)
                db.session.add(new_handicap)
                db.session.commit()
    return redirect(url_for('home.view_rounds'))
