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

# new routes
from golfapp.routes.auth import auth_bp
from golfapp.routes.courseranking import courseranking_bp
from golfapp.routes.strokes import strokes_bp
from golfapp.routes.viewplayer import viewplayer_bp
from golfapp.routes.viewplayers import viewplayers_bp

app.register_blueprint(auth_bp)
app.register_blueprint(courseranking_bp)
app.register_blueprint(strokes_bp)
app.register_blueprint(viewplayer_bp)
app.register_blueprint(viewplayers_bp)

with app.app_context():
    db.create_all()

migrate.init_app(app, db)
