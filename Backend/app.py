from flask import Flask, request, jsonify
from data.read import get_timetables
from data.models import db, User
from datetime import datetime
from typing import List, Dict, Any
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authorisation.auth import check_password, init_jwt
from flask_sqlalchemy import SQLAlchemy

### App configuration

app = Flask(__name__)

# This connects to local postgresql docker instance, change in future if you want it on a public server
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@localhost:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialise the database with the Flask app
db.init_app(app)
# Initialise JWTManager from auth.py
jwt = init_jwt(app)

# Creates the tables if not yet created
with app.app_context():
    db.create_all()

### End

@app.route('/timetables')
@jwt_required() # Protect this route
def timetables() -> List[Dict[str, Any]]:
    """
    Gets bus timetables
    """
    
    timetables = get_timetables()

    return [
        timetable | {
            "arrival_min": (datetime.strptime(timetable['arrival_time'],"%Y-%m-%dT%H:%M:%S.%f") - datetime.now()).total_seconds() // 60
        }
        for timetable in timetables
    ]

@app.route('/login', methods=['POST'])
def login():
    data = request.json  # Get JSON data from React frontend
    email = data.get('email')
    password = data.get('password')

    # get user from DB
    
    if True:  # if user exists and password verified
        #login the user
        return jsonify({"message": "Login successful", "success": True, "user": 4}), 200 # last field should be user ID
    else:
        return jsonify({"message": "Invalid email or password", "success": False}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists

    # Hash the password and store the user
    return jsonify({'message': 'User created successfully'}), 201



if __name__ == '__main__':
    app.run(debug=True)