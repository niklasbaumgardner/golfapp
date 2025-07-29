from flask import Flask
from flask_bcrypt import Bcrypt
from golfapp.config import Config
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
import sentry_sdk
import os


class Base(DeclarativeBase):
    pass


app = Flask(__name__)


if not os.environ.get("FLASK_DEBUG"):
    sentry_sdk.init(
        dsn=os.environ.get("SENTRY_DSN"),
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for tracing.
        traces_sample_rate=1.0,
        _experiments={"enable_logs": True},
        release="nbgolf@1.0.10",
    )


app.config.from_object(Config)

db = SQLAlchemy(engine_options=dict(poolclass=NullPool, future=True), model_class=Base)
db.init_app(app)

bcrypt = Bcrypt()
bcrypt.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth_bp.login"
login_manager.login_message_category = "alert-primary"

mail = Mail()
mail.init_app(app)


# new routes
from golfapp.routes.addcourse import addcourse_bp
from golfapp.routes.admin import admin_bp
from golfapp.routes.auth import auth_bp
from golfapp.routes.courseranking import courseranking_bp
from golfapp.routes.preferences import preferences_bp
from golfapp.routes.profile import profile_bp
from golfapp.routes.strokes import strokes_bp
from golfapp.routes.stats import stats_bp
from golfapp.routes.theme import theme_bp
from golfapp.routes.viewplayer import viewplayer_bp
from golfapp.routes.viewplayers import viewplayers_bp
from golfapp.utils.context_processor import context_processor_bp

app.register_blueprint(addcourse_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(courseranking_bp)
app.register_blueprint(preferences_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(strokes_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(theme_bp)
app.register_blueprint(viewplayer_bp)
app.register_blueprint(viewplayers_bp)
app.register_blueprint(context_processor_bp)

with app.app_context():
    db.create_all()

migrate = Migrate()
migrate.init_app(app, db)
