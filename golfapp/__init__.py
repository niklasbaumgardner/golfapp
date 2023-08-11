from flask import Flask
from flask_bcrypt import Bcrypt
from golfapp.config import Config
from golfapp.extensions import db, login_manager
from flask_migrate import Migrate
from flask_mail import Mail

bcrypt = Bcrypt()
migrate = Migrate()
mail = Mail()


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.login_message_category = "alert-primary"
    mail.init_app(app)

    from golfapp.user.auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from golfapp.home.home import home as home_blueprint
    app.register_blueprint(home_blueprint)

    from golfapp.home.api import api as api_blueprint
    app.register_blueprint(api_blueprint)

    with app.app_context():
        db.create_all()

    migrate.init_app(app, db)

    return app
