
from flask import Blueprint, render_template, flash, redirect, url_for, request


# app = Flask(__name__)

home = Blueprint('home', __name__)
# mail = Mail(home)

@home.route('/', methods=["GET"])
def index():
    return "HELLO WORLD"








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

