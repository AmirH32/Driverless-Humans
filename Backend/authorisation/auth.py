from flask import Flask
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash

# Init for Flask & JWT Manager 
def init_jwt(app: Flask):
    app.config['JWT_SECRET_KEY'] = 'SECRET'  # Change in future
    jwt = JWTManager(app)
    return jwt

def verify_password(args):
    # authenticate the user
    pass
        