from flask import Flask, request, jsonify
from data.read import get_timetables
from datetime import datetime
from typing import List, Dict, Any
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from authorisation.auth import check_password, init_jwt



app = Flask(__name__)

# Initialize JWTManager from auth.py
jwt = init_jwt(app)

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


if __name__ == '__main__':
    app.run(debug=True)