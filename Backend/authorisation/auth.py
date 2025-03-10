from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from Backend.database.models import User, db
import os
import re


# Init for Flask & JWT Manager
# Init for Flask & JWT Manager
def init_jwt(app: Flask):
    """
    Arguments: Flask app

    Purpose: Sets the secret key for generating jwt tokens as well as the error handlers and messages for unauthorised, invalid and expired tokens
    """
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY", "SECRET") # Add test in future to make sure it's set correctly in prod
    jwt = JWTManager(app)
    
    # Add JWT error handlers
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({
            "message": "Missing authentication token",
            "success": False,
            "error_type": "missing_token"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            "message": "Invalid authentication token",
            "success": False,
            "error_type": "invalid_token"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "message": "Expired authentication token",
            "success": False,
            "error_type": "token_expired"
        }), 401
        
    return jwt

def generate_hashed_password(password):
    """
    Arguments: An password string

    Purpose: Generates a secure random SALT as well as a password hash
    """
    salt = os.urandom(64).hex()
    hashed_password = generate_password_hash(password + salt, method="pbkdf2:sha256", salt_length=16)
    return hashed_password, salt


def create_user(email, password, name, role):
    """
    Arguments: An email, password, name & role strings

    Purpose: Generates a hashed password and salt and creates a new user that is committed to the DB
    """
    hashed_password, salt = generate_hashed_password(password)
    new_user = User(Email=email, Password=hashed_password, Name=name, Salt=salt, Role=role)
    db.session.add(new_user)
    db.session.commit()
    return


def is_valid_email(email):
    """
    Arguments: An email string

    Purpose: Checks that the email has an "@" followed by a "." afterwards
    """
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(email_regex, email) is not None


def is_strong_password(password):
    """
    Arguments: A password string

    Purpose: Makes sure the password is >= 16 chars, contains one lower & upper case letter, one digit and one special character
    """
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
