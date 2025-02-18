from dotenv import load_dotenv
from .bus_data import get_timetables
import pandas as pd
import os
from flask import Flask, request, jsonify, make_response
from .data.models import db, User, Reservations, UserReservation, AccessibilityRequirement, AccessibilityOptions, UserAccessibility, UserToOptions
from typing import List, Dict, Any
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .authorisation.auth import init_jwt, create_user, is_strong_password, is_valid_email
from flask_sqlalchemy import SQLAlchemy
from markupsafe import escape
import datetime
from datetime import timedelta
from flask_talisman import Talisman
load_dotenv()

### App configuration

app = Flask(__name__)

if os.getenv("FLASK_ENV") == "production":
    Talisman(app, force_https=True)
else:
    Talisman(app, force_https=False)

def sanitise_input(string):
    return escape(string.strip())

def add_and_commit(entry):
    db.session.add(entry)
    db.session.commit()

def auth_init():
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

auth_init()

@app.route('/timetables')
@jwt_required() # Protect this route
def timetables() -> List[Dict[str, Any]]:
    """
    Gets bus timetables
    """
    stop_id = request.args.get('stop_id')
    route_ids = ['U1','U2']
    
    all_timetables = []
    for route_id in route_ids:
        timetables = get_timetables(stop_id, route_id)
        if len(timetables) == 0:
            continue
        timetables['arrival_time'] = timetables['arrival_time'].apply(lambda x: x.isoformat())
        timetable = timetables.loc[timetables['arrival_min'].idxmin()]
        all_timetables.append(timetable[['route_id','route_name','arrival_min','arrival_time','seats_empty','ramp_type']])
    
    if all_timetables:
        all_timetables_df = pd.DataFrame(all_timetables)
    else:
        all_timetables_df = pd.DataFrame(columns=['route_id', 'route_name', 'arrival_min', 'arrival_time', 'seats_empty', 'ramp_type'])

    print(all_timetables)
    print(all_timetables_df)
    return all_timetables_df.to_json(orient='records')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = sanitise_input(data.get('email'))
    password = data.get('password')

    user = User.query.filter_by(Email=email).first()
    if user and user.verify_password(password):
        access_token = create_access_token(identity=user.UserID, expires_delta = timedelta(hours=1))
        
        # Set JWT in HttpOnly cookie
        response = make_response(jsonify({'message': 'Login successful', 'success': True}))
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')

        return response, 200
    else:
        return jsonify({'message': 'Invalid email or password', 'success': False}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = sanitise_input(data.get('email', ''))
    name = sanitise_input(data.get('name', ''))
    password = data.get('password', '')

    # Make sure email and password fields are filled
    if not email or not password or not name:
        return jsonify({'message': 'All fields are required', 'success': False}), 400

    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email format', 'success': False}), 400
    
    if not is_strong_password(password):
        return jsonify({'message': 'Password must be at least 16 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.', 'success': False}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(Email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists', 'success': False}), 400

    # Create the user
    create_user(email, password, name)
    
    return jsonify({'message': 'User created successfully', 'success': True}), 201

@app.route('/create_reservation', methods=['POST'])
@jwt_required() # Protect this route
def create_reservation():
    data = request.get_json()
    stopID1 = sanitise_input(data.get('StopID1',''))
    stopID2 = sanitise_input(data.get('StopID2',''))
    busID = sanitise_input(data.get('BusID',''))
    time = data.get('time', '')

    userID = get_jwt_identity()

    if not all([stopID1, stopID2, busID, time]):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        # Create reservation
        new_reservation = Reservations(
            StopID1=stopID1,
            StopID2=stopID2,
            BusID=busID,
            time=datetime.strptime(time, "%Y-%m-%d %H:%M:%S")
        )
        add_and_commit(new_reservation)

        # Link the user to the reservation
        user_reservation = UserReservation(UserID=userID, ReservationID=new_reservation.ReservationID)
        add_and_commit(user_reservation)

        return jsonify({'message': 'Reservation created successfully', 'reservation_id': new_reservation.ReservationID}), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/timetables?stop_id=0500CCITY424