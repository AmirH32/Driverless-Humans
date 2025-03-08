from flask import Flask
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from Backend.database.models import User, db
import os
import re


# Init for Flask & JWT Manager
def init_jwt(app: Flask):
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "SECRET") # Add test in future to make sure it's set correctly in prod
    jwt = JWTManager(app)
    return jwt

def generate_hashed_password(password):
    salt = os.urandom(64).hex()
    hashed_password = generate_password_hash(password + salt, method="pbkdf2:sha256", salt_length=16)
    return hashed_password, salt


def create_user(email, password, name, role):
    hashed_password, salt = generate_hashed_password(password)
    new_user = User(Email=email, Password=hashed_password, Name=name, Salt=salt, Role=role)
    db.session.add(new_user)
    db.session.commit()
    return


def is_valid_email(email):
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(email_regex, email) is not None


def is_strong_password(password):
    if len(password) < 16:
        return False

    # Regex to check for required character types
    if not re.search(r"[A-Z]", password):  # At least one uppercase letter
        return False
    if not re.search(r"[a-z]", password):  # At least one lowercase letter
        return False
    if not re.search(r"\d", password):  # At least one digit
        return False
    if not re.search(
        r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/|`~]', password
    ):  # At least one special char
        return False

    return True  # Passes all checks
