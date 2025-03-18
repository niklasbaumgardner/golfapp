from flask import Flask
from flask_bcrypt import Bcrypt
from golfapp.config import Config
from flask_migrate import Migrate
from flask_mail import Mail
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool


bcrypt = Bcrypt()
migrate = Migrate()
mail = Mail()
login_manager = LoginManager()
db = SQLAlchemy(engine_options=dict(poolclass=NullPool))


app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "auth_bp.login"
login_manager.login_message_category = "alert-primary"
mail.init_app(app)


# new routes
from golfapp.routes.addcourse import addcourse_bp
from golfapp.routes.admin import admin_bp
from golfapp.routes.auth import auth_bp
from golfapp.routes.courseranking import courseranking_bp
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
app.register_blueprint(profile_bp)
app.register_blueprint(strokes_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(theme_bp)
app.register_blueprint(viewplayer_bp)
app.register_blueprint(viewplayers_bp)
app.register_blueprint(context_processor_bp)

with app.app_context():
    db.create_all()

migrate.init_app(app, db)
