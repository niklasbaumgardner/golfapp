from flask import Flask
from flask_bcrypt import Bcrypt
from golfapp.config import Config

bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    bcrypt.init_app(app)

    from golfapp.user.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from golfapp.main.home import home as home_blueprint
    app.register_blueprint(home_blueprint)

    return app