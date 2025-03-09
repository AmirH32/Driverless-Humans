import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

from Backend.data.timetables import get_timetables
from Backend.data.stops import get_autocomplete_stops, get_stops_data
from Backend.data.utils import calc_coord_distance

from flask import Flask, request, jsonify, make_response
from flask_migrate import Migrate

from Backend.database.models import (
    db,
    User,
    Reservations,
    UserReservation,
    VolunteerReservation
)
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
    create_refresh_token,
)
from Backend.authorisation.auth import (
    init_jwt,
    create_user,
    is_strong_password,
    is_valid_email,
    generate_hashed_password,
)
from markupsafe import escape

from flask_talisman import Talisman
from flask_cors import CORS

import pandas as pd

DISABLE_AUTHORISATION = False
if DISABLE_AUTHORISATION:
    jwt_required = lambda refresh=True: (lambda x:x)

### Load environment variables (BODS_API_KEY)
# load_dotenv()

### App configuration
app = Flask(__name__)

### Only need this for development on browser but should work without on phones (REMOVE IN PROD)
CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": ["http://localhost:8081", "http://127.0.0.1:8081"]}},
)


# Define Content Security Policy (CSP) to allow frontend this is only needed in DEV (REMOVE IN PROD)
csp = {
    "default-src": [
        "'self'",  # Allow content from the same origin
        "http://localhost:8081",  # Allow frontend origin
    ],
    "script-src": ["'self'", "'unsafe-inline'", "http://localhost:8081"],
    "style-src": ["'self'", "'unsafe-inline'", "http://localhost:8081"],
    "img-src": [
        "'self'",
        "data:",  # Allow inline images
    ],
}
###


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
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        os.getenv('DATABASE_URL', "postgresql://myuser:mypassword@localhost:5432/mydatabase")
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Add this to your auth_init() function or wherever you're configuring JWT
    app.config["JWT_TOKEN_LOCATION"] = ["cookies", "headers"]
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # During development
    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
    app.config["JWT_REFRESH_COOKIE_NAME"] = "refresh_token"

    # Initialise the database with the Flask app
    db.init_app(app)
    migrate = Migrate(app, db)
    # Initialise JWTManager from auth.py
    init_jwt(app)

    # Creates the tables if not yet created
    with app.app_context():
        # db.drop_all()
        db.create_all()



auth_init()


@app.route("/timetables", methods=["GET"])
@jwt_required()
def timetables() -> List[Dict[str, Any]]:
    """
    Gets bus timetables as JSON.

    :returns timetables_json: A list of dictionaries containing bus timetable information in the format of `data.models.Timetable`

    Example (with William Gates Building): http://127.0.0.1:5000/timetables?stop_id=0500CCITY424
    """
    origin_id = request.args.get("origin_id")
    destination_id = request.args.get("destination_id")
    timetables = get_timetables(origin_id=origin_id, destination_id=destination_id)
    timetables_json = [timetable.model_dump(mode="json") for timetable in timetables]
    return timetables_json


@app.route("/autocomplete", methods=["GET"])
@jwt_required()
def autocomplete() -> List[Dict[str, Any]]:
    """
    Get autocompletions of a source/destination bus stop name search.

    :returns autocomplete_json: A list of dictionaries containing autocompletion suggestions in the format of `data.models.Autocompletion`
    """
    input = request.args.get("input")
    limit = int(request.args.get("limit"))

    autocompletions = get_autocomplete_stops(name=input, limit=limit)
    autocompletions_json = [
        autocompletion.model_dump(mode="json") for autocompletion in autocompletions
    ]
    return autocompletions_json


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = sanitise_input(data.get("email"))
    password = data.get("password")

    user = User.query.filter_by(Email=email).first()
    if user and user.verify_password(password):
        access_token = create_access_token(
            identity=str(user.UserID), 
            expires_delta=timedelta(hours=1), 
        )
        refresh_token = create_refresh_token(
            identity=str(user.UserID),
            expires_delta=timedelta(days=7),
        )  # 7 days expiry

        # Set JWT in HttpOnly cookie
        response = make_response(
            jsonify({"message": "Login successful", "success": True})
        )
        # Change samesite to "Strict" in prod
        response.set_cookie(
            "access_token", 
            access_token, 
            httponly=True, 
            secure=True, 
            samesite="None"
        )
        response.set_cookie(
            "refresh_token", 
            refresh_token, 
            httponly=True, 
            secure=True, 
            samesite="None"
        )

        return response, 200
    else:
        return jsonify({
            "message": "Invalid email or password", 
            "success": False,
            "error_type": "invalid_credentials"
        }), 401


@app.route("/user-info", methods=["GET"])
@jwt_required()
def get_user_info():
    user_id = get_jwt_identity()
    user = User.query.filter_by(UserID=user_id).first()
    
    if not user:
        return jsonify({"error": "User not found", "success": False}), 404
    
    return jsonify({
        "user_id": user_id,
        "role": user.Role,
        "name": user.Name,
        "email": user.Email,
        "success": True
    }), 200


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = sanitise_input(data.get("email", ""))
    name = sanitise_input(data.get("name", ""))
    password = data.get("password", "")
    hasDisability = data.get("hasDisability", "")

    # Make sure email and password fields are filled
    if not email or not password or not name:
        return jsonify({"message": "All fields are required", "success": False}), 400

    if not is_valid_email(email):
        return jsonify({"message": "Invalid email format", "success": False}), 400

    if not is_strong_password(password):
        return jsonify(
            {
                "message": "Password must be at least 16 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.",
                "success": False,
            }
        ), 400
    
    if hasDisability == True:
        role = "Disabled"
    else:
        role = "Volunteer"

    # Check if user already exists
    existing_user = User.query.filter_by(Email=email).first()
    if existing_user:
        return jsonify({"message": "User already exists", "success": False}), 400

    # Create the user
    create_user(email, password, name, role)

    return jsonify({"message": "User created successfully", "success": True}), 201


@app.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    response = make_response(
        jsonify({"message": "Logout successful", "success": True}), 200
    )

    # Clear access and refresh tokens from cookies
    response.set_cookie("access_token", "", expires=0)
    response.set_cookie("refresh_token", "", expires=0)

    return response


### FRONTEND NEEDS TO REFRESH ACCESS TOKENS EVERY HOUR OR EVERYTIME IT EXPIRES
@app.route("/refresh")
@jwt_required(refresh=True)
def refresh():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(UserID=current_user).first()

        new_access_token = create_access_token(
            identity=str(current_user), fresh=False, 
            expires_delta=timedelta(hours=1)
        )
        new_refresh_token = create_refresh_token(
            identity=str(current_user), expires_delta=timedelta(days=7)
        )

        response = make_response(jsonify({"access_token": new_access_token}), 200)
        # CHANGE samesite to "Strict" in prod
        response.set_cookie(
            "access_token",
            new_access_token,
            httponly=True,
            secure=True,
            samesite="None",
        )
        # To prevent logging the user out after 7 days, everytime the user sends a request to refresh, their refresh token is renewed
        response.set_cookie(
            "refresh_token",
            new_refresh_token,
            httponly=True,
            secure=True,
            samesite="None",
        )
        return response
    except Exception as e:
        print(f"Refresh error: {e}")  # Debug the actual error
        # Refresh token has expired
        return jsonify({"message": "Please login again."}), 401


@app.route("/create_reservation", methods=["POST"])
@jwt_required()  # Protect this route
def create_reservation():
    """

    """
    data = request.get_json()
    stopID1 = sanitise_input(data.get("StopID1", ""))
    stopID2 = sanitise_input(data.get("StopID2", ""))
    busID = sanitise_input(data.get("BusID", ""))
    time = data.get("Time", "") # This will be the time the bus arrives at the bus stop
    VolunteerCount = data.get("VolunteerCount", "")

    userID = get_jwt_identity()
    print(userID)
    if not all([stopID1, stopID2, busID, time]):
        return jsonify({"message": "Missing required fields"}), 400

    # Check if reservations with the same User ID exist
    # First, query the UserReservation table to find the user's reservations
    existing_user_reservations = (
        db.session.query(UserReservation)
        .filter_by(UserID=userID)  # Filter by userID
        .join(Reservations, UserReservation.ReservationID == Reservations.ReservationID)  # Join with the Reservations table
        .filter(Reservations.Time == time, Reservations.BusID == busID)  # Check Time and busID
        .first()
    )

    # If there are any matching reservations for this user
    if existing_user_reservations:
        return jsonify(
            {"message": "This reservation already exists for this user."}
        ), 400
    
    ### END OF CHECKS
    try:
        new_reservation = Reservations(
            StopID1=stopID1,
            StopID2=stopID2,
            BusID=busID,
            Time=datetime.strptime(time, "%Y-%m-%d %H:%M:%S"),
            VolunteerCount = VolunteerCount,
        )

        db.session.add(new_reservation)

        # Link the user to the reservation
        user_reservation = UserReservation(
            UserID=userID, ReservationID=new_reservation.ReservationID
        )
        
        db.session.add(user_reservation)
        db.session.commit()

        return jsonify(
            {
                "message": "Reservation created successfully",
                "reservation_id": new_reservation.ReservationID,
            }
        ), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500
    
@app.route("/add_volunteer", methods=["POST"])
@jwt_required()  # Protect this route
def add_volunteer():
    data = request.get_json()

    reservationID = data.get("ReservationID", "")

    userID = get_jwt_identity()

    # Get the user object to check the role
    user = db.session.query(User).filter_by(UserID=userID).first()
    
    # Check the user has the right role
    if user.Role != "Volunteer":
        return jsonify(
            {
                "message": "Invalid Role",
                "success": False,
            }
        ), 400
    
    # Check the user isn't already volunteering for this reservation
    # If we get reservation ID from frontend we can check with reservation ID instead
    existing_volunteer_reservations = (
        db.session.query(VolunteerReservation)
        .filter_by(UserID=userID, ReservationID = reservationID)  # Filter by userID
        .first()
    )

    # If there are any matching reservations for this user
    if existing_volunteer_reservations:
        return jsonify(
            {"message": "The user is already volunteering for this reservation."}
        ), 400
    

    # Find reservation to add the user
    # If we get reservation ID from frontend we can check with reservation ID instead
    reservation = db.session.query(Reservations).filter_by(ReservationID = reservationID).first()

    if not reservation:
        return jsonify({"message":"Reservation not found."}), 404
    # End of Checks

    try:
        reservation.VolunteerCount += 1

        # Link the volunteer to the reservation
        volunteerReservation = VolunteerReservation(
            UserID=userID, ReservationID = reservation.ReservationID
        )

        db.session.add(volunteerReservation)

        db.session.commit()

        return jsonify(
            {
                "message": "Volunteer added to the reservation successfully.",
                "reservation_id": reservation.ReservationID,
            }
        ), 201
    
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500
        
@app.route("/remove_volunteer", methods=["POST"])
@jwt_required()
def remove_volunteer():  
    data = request.get_json()

    reservationID = data.get("ReservationID", "")
    userID = get_jwt_identity()

    try:
        reservation = db.session.query(Reservations).filter_by(ReservationID = reservationID).first()
        volunteerReservation = db.session.query(VolunteerReservation).filter_by(UserID=userID, ReservationID=reservationID).first()

        if not reservation:
            return jsonify({"message":"Reservation not found."}), 404
        
        if not volunteerReservation:
            return jsonify({"message":"Reservation not found."}), 404
        
        reservation.VolunteerCount -= 1
        db.session.delete(volunteerReservation)

        db.session.commit()

        return jsonify({"message": "Volunteer removed from the reservation successfully."}), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500

@app.route("/get_reservation", methods=["GET"])
@jwt_required()
def get_reservation():
    try:
        reservation_id = int(request.args.get("reservationID",None))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    res = (
        db.session.query(Reservations)
        .filter_by(ReservationID=reservation_id)
        .first()
    )

    reservation_dict = {
        "ReservationID": res.ReservationID,
        "StopID1": res.StopID1,
        "StopID2": res.StopID2,
        "BusID": res.BusID,
        "Time": res.Time,
        "VolunteerCount": res.VolunteerCount
    }
    return reservation_dict

    reservations_df = pd.DataFrame([{
        "ReservationID": res.ReservationID,
        "StopID1": res.StopID1,
        "StopID2": res.StopID2,
        "BusID": res.BusID,
        "Time": res.Time,
        "VolunteerCount": res.VolunteerCount
    } for res in reservations], columns=["ReservationID", "StopID1", "StopID2", "BusID", "Time", "VolunteerCount"])

    reservations_df = pd.DataFrame({"ReservationID":[11,12], "StopID1":["0500CCITY423","0500CCITY523"], "StopID2":["0500CCITY523","0500CCITY423"], "BusID":["v0","v1"], "Time":[100,101], "VolunteerCount":[0,1]})
    
    latlongs_df = get_stops_data().reset_index()
    reservations_df = pd.merge(reservations_df, latlongs_df, left_on='StopID1', right_on='id', how='inner')
    reservations_df = reservations_df.drop(columns=['id'])

    reservations_df["distance"] = reservations_df.apply(
        lambda row: calc_coord_distance((row["latitude"], row["longitude"]), volunteer_latlong),
        axis=1,
    )

    reservations_df = reservations_df.sort_values(by="distance").head(limit)
    
    reservations_list = []
    for _,res in reservations_df.iterrows():
        timetables = [t for t in get_timetables(origin_id=res["StopID1"],destination_id=res["StopID2"])
                      if t.vehicle_id == res["BusID"]]
        
        if len(timetables) == 0:
            continue

        timetable = timetables[0]

        reservations_list.append({
            "reservation_id": res["ReservationID"],
            "origin_id": res["StopID1"],
            "destination_id": res["StopID2"],
            "volunteer_count": res["VolunteerCount"],
            "distance": res["distance"]
        } | timetable.model_dump(mode='json'))

    return jsonify({"message": "Reservations retrieved successfully.", "reservations": reservations_list}), 200


@app.route("/show_reservations", methods=["GET"])
@jwt_required()
def show_reservations():
    try:
        volunteer_latitude = request.args.get("latitude",None)
        volunteer_longitude = request.args.get("longitude",None)
        limit = int(request.args.get("limit",5))
        volunteer_latlong = (float(volunteer_latitude), float(volunteer_longitude))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    reservations = db.session.query(Reservations).all()

    if len(reservations) == 0:
        return jsonify({"message": "No reservations found.", "reservations": []}), 200

    reservations_df = pd.DataFrame([{
        "ReservationID": res.ReservationID,
        "StopID1": res.StopID1,
        "StopID2": res.StopID2,
        "BusID": res.BusID,
        "Time": res.Time,
        "VolunteerCount": res.VolunteerCount
    } for res in reservations], columns=["ReservationID", "StopID1", "StopID2", "BusID", "Time", "VolunteerCount"])

    # reservations_df = pd.DataFrame({"ReservationID":[11,12], "StopID1":["0500CCITY423","0500CCITY523"], "StopID2":["0500CCITY523","0500CCITY423"], "BusID":["v0","v1"], "Time":[100,101], "VolunteerCount":[0,1]})
    print(reservations_df)

    latlongs_df = get_stops_data().reset_index()
    reservations_df = pd.merge(reservations_df, latlongs_df, left_on='StopID1', right_on='id', how='inner')
    reservations_df = reservations_df.drop(columns=['id'])

    reservations_df["distance"] = reservations_df.apply(
        lambda row: calc_coord_distance((row["latitude"], row["longitude"]), volunteer_latlong),
        axis=1,
    )

    reservations_df = reservations_df.sort_values(by="distance").head(limit)
    
    reservations_list = []
    for _,res in reservations_df.iterrows():
        timetables = [t for t in get_timetables(origin_id=res["StopID1"],destination_id=res["StopID2"])
                      if t.vehicle_id == res["BusID"]]
        
        if len(timetables) == 0:
            continue

        timetable = timetables[0]

        reservations_list.append({
            "reservation_id": res["ReservationID"],
            "origin_id": res["StopID1"],
            "destination_id": res["StopID2"],
            "volunteer_count": res["VolunteerCount"],
            "distance": res["distance"]
        } | timetable.model_dump(mode='json'))

    return jsonify({"message": "Reservations retrieved successfully.", "reservations": reservations_list}), 200

@app.route("/delete_reservation", methods=["POST"])
@jwt_required()
def delete_reservation():
    try:
        userID = get_jwt_identity()

        # Find the most recent reservation for the user to delete
        reservation = (
            db.session.query(Reservations)
            .join(UserReservation)
            .filter(UserReservation.UserID == userID)
            .order_by(Reservations.Time.desc())
            .first()
        )

        if not reservation:
            return jsonify({"message": "No reservations found for this user."}), 404

        # Delete the reservation
        db.session.delete(reservation)
        db.session.commit()

        return jsonify({"message": "Reservation deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/change_password", methods=["POST"])
@jwt_required()
def change_password():
    try: 
        userID = get_jwt_identity()

        # Get the new password from the request body
        data = request.get_json()
        new_password = data.get('newPassword', None)

        if not new_password:
            return jsonify({"error": "New password is required."}), 400

        # Validate password length or any other rules
        if not is_strong_password(new_password):
            return jsonify(
                {
                    "message": "Password must be at least 16 characters long, include an uppercase letter, a lowercase letter, a digit, and a special character.",
                    "success": False,
                }
        ), 400

        # Find the user in the database
        user = User.query.filter_by(UserID=userID).first()
        
        if not user:
            return jsonify({"error": "User not found."}), 404
        
        # Hash the new password
        hashed_password, salt = generate_hashed_password(new_password)

        # Update the user's password in the database
        user.Password = hashed_password
        user.Salt = salt
        db.session.commit()

        return jsonify({"message": "Password changed successfully.", "success":True}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/edit_profile", methods=["POST"])
@jwt_required()
def edit_profile():
    try: 
        userID = get_jwt_identity()

        # Get the new password from the request body
        data = request.get_json()
        name = data.get('name', None)
        email = data.get('email', None)
        password = data.get('currentPassword', None)

        if not all([name, email, password]):
            return jsonify({"error": "Name, email and password fields are required."}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format", "success": False}), 400

        # Validate password length or any other rules
        user = User.query.filter_by(UserID=userID).first()
        if user and user.verify_password(password):
            user.Email = email
            user.Name = name

            db.session.commit()

            return jsonify({"message": "User Profile changed successfully.", "success":True}), 200
        elif not user:
            return jsonify({"error": "User not found."}), 404
        else:
            return jsonify({
            "message": "Incorrect password", 
            "success": False,
            "error_type": "invalid_credentials"
        }), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    



if __name__ == "__main__":
    app.run(debug=True)
