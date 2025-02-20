from dotenv import load_dotenv
from .bus_data import get_timetables
import pandas as pd
import os
from flask import Flask, request, jsonify, make_response
from .data.models import db, User, Reservations, UserReservation, AccessibilityRequirement, AccessibilityOptions, UserAccessibility, UserToOptions
from typing import List, Dict, Any
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from .authorisation.auth import init_jwt, create_user, is_strong_password, is_valid_email
from flask_sqlalchemy import SQLAlchemy
from markupsafe import escape
from datetime import datetime
from datetime import timedelta
from flask_talisman import Talisman
from flask_cors import CORS
load_dotenv()

### App configuration

app = Flask(__name__)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:8081", "http://127.0.0.1:8081"]}})


# Define Content Security Policy (CSP) to allow frontend
csp = {
    'default-src': [
        "'self'",  # Allow content from the same origin
        "http://localhost:8081",  # Allow frontend origin
    ],
    'script-src': [
        "'self'",
        "'unsafe-inline'",  
        "http://localhost:8081"
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'",
        "http://localhost:8081"
    ],
    'img-src': [
        "'self'",
        "data:"  # Allow inline images
    ],
}

if os.getenv("FLASK_ENV") == "production":
    Talisman(app, content_security_policy=csp, force_https=True)
else:
    Talisman(app, content_security_policy=csp, force_https=False)


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
        access_token = create_access_token(identity=str(user.UserID), expires_delta = timedelta(hours=1))
        refresh_token = create_refresh_token(identity=str(user.UserID), expires_delta=timedelta(days=7))  # 7 days expiry
        
        # Set JWT in HttpOnly cookie
        response = make_response(jsonify({'message': 'Login successful', 'success': True}))
        # Change samesite to "Strict" in prod
        response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='None')
        response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='None')

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

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = make_response(jsonify({'message': 'Logout successful', 'success': True}), 200)

    # Clear access and refresh tokens from cookies
    response.set_cookie('access_token', '', expires=0)
    response.set_cookie('refresh_token', '', expires=0)

    return response


### FRONTEND NEEDS TO REFRESH ACCESS TOKENS EVERY HOUR OR EVERYTIME IT EXPIRES
@app.route("/refresh")
@jwt_required(refresh=True)
def refresh(self):
    try: 
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=str(current_user), fresh=False, expires_delta=timedelta(hours=1))
        new_refresh_token = create_refresh_token(identity=str(current_user), expires_delta=timedelta(days=7)) 


        response = make_response(jsonify({'access_token': new_access_token}), 200)
        # CHANGE samesite to "Strict" in prod
        response.set_cookie('access_token', new_access_token, httponly=True, secure=True, samesite='None')
        # To prevent logging the user out after 7 days, everytime the user sends a request to refresh, their refresh token is renewed
        response.set_cookie('refresh_token', new_refresh_token, httponly=True, secure=True, samesite='None')
        return response
    except: 
        # Refresh token has expired
        return jsonify({'message': 'Please login again.'}), 401

@app.route('/create_reservation', methods=['POST'])
@jwt_required() # Protect this route
def create_reservation():
    data = request.get_json()
    stopID1 = sanitise_input(data.get('StopID1',''))
    stopID2 = sanitise_input(data.get('StopID2',''))
    busID = sanitise_input(data.get('BusID',''))
    time = data.get('Time', '')

    userID = get_jwt_identity()

    if not all([stopID1, stopID2, busID, time]):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if reservation exists
    existing_user_reservations = db.session.query(UserReservation).filter_by(UserID=userID).all()
    if existing_user_reservations:
        for user_reservation in existing_user_reservations:
            reservation_id = user_reservation.ReservationID
            reservation = db.session.query(Reservations).filter_by(ReservationID=reservation_id, Time=time).first()
            if reservation: 
                  return jsonify({'message': 'This reservation already exists for this user.'}), 400
            else:
                pass
    try: 
        new_reservation = Reservations(
            StopID1=stopID1,
            StopID2=stopID2,
            BusID=busID,
            Time=datetime.strptime(time, "%Y-%m-%d %H:%M:%S")
        )

        add_and_commit(new_reservation)

        # Link the user to the reservation
        user_reservation = UserReservation(UserID=userID, ReservationID=new_reservation.ReservationID)
        add_and_commit(user_reservation)

        return jsonify({'message': 'Reservation created successfully', 'reservation_id': new_reservation.ReservationID}), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({'error': str(e)}), 500

@app.route('/delete_reservation', methods=['POST'])
@jwt_required()
def delete_reservation():
    try:
        userID = get_jwt_identity()

        # Find the most recent reservation for the user to delete
        reservation = db.session.query(Reservations).join(UserReservation).filter(UserReservation.UserID == userID).order_by(Reservations.Time.desc()).first()

        if not reservation:
            return jsonify({'message': 'No reservations found for this user.'}), 404

        # Delete the reservation
        db.session.delete(reservation)
        db.session.commit()

        return jsonify({'message': 'Reservation deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    


if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/timetables?stop_id=0500CCITY424