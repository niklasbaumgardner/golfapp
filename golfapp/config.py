import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI")
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get("EMAIL_USER")
    MAIL_PASSWORD = os.environ.get("EMAIL_PASS")
    MAIL_DEFAULT_SENDER = ("NB Golf", "golf@niklasb.com")
    ERROR_LOGGING_EMAIL = os.environ.get("ERROR_LOGGING_EMAIL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REMEMBER_COOKIE_NAME = os.environ.get("REMEMBER_COOKIE_NAME")
    REMEMBER_COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN")
    SESSION_COOKIE_NAME = os.environ.get("SESSION_COOKIE_NAME")
    SESSION_COOKIE_DOMAIN = os.environ.get("COOKIE_DOMAIN")
