from flask import Flask
from flask_bcrypt import Bcrypt
from golfapp.config import Config
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy


bcrypt = Bcrypt()
migrate = Migrate()
mail = Mail()
login_manager = LoginManager()
db = SQLAlchemy(
    engine_options=dict(
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        # echo=True,
    )
)


app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "auth.login"
login_manager.login_message_category = "alert-primary"
mail.init_app(app)

from golfapp.user.auth import auth as auth_blueprint
from golfapp.home.home import home as home_blueprint
from golfapp.home.api import api as api_blueprint

app.register_blueprint(auth_blueprint)
app.register_blueprint(home_blueprint)
app.register_blueprint(api_blueprint)

with app.app_context():
    db.create_all()

migrate.init_app(app, db)
