
from flask import Blueprint, render_template, flash, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
from golfapp.models import User, Course, Round, Handicap
from golfapp.extensions import db

# app = Flask(__name__)

home = Blueprint('home', __name__)
# mail = Mail(home)

@home.route('/', methods=["GET"])
def index():
    return render_template('base.html')


@home.route('/add_round', methods=['GET'])
@login_required
def add_round():
    return render_template('addround.html')


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








# set FLASK_APP=hello.py
# $env:FLASK_APP = "hello.py"
# WSL
# export FLASK_APP=home.py
# flask run


# $site->dbConfigure('mysql:host=mysql-user.cse.msu.edu;dbname=baumga91',
#         'baumga91',       // Database user
#         'password',     // Database password
#         '');            // Table prefix


# if __name__ == '__main__':
#     app.run(debug=True)
    # app.run()

