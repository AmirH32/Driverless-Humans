import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

from Backend.data.timetables import get_timetables
from Backend.data.stops import get_autocomplete_stops, get_stops_data
from Backend.data.utils import calc_coord_distance

from flask import Flask, request, jsonify, make_response, send_file
from flask_migrate import Migrate
import uuid

from Backend.database.models import (
    db,
    User,
    Reservations,
    UserReservation,
    VolunteerReservation,
    Roles,
    Document
)

from Backend.database.utils import get_reservation_data

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

import psycopg2
import pandas as pd

from werkzeug.utils import secure_filename

DISABLE_AUTHORISATION = False

if DISABLE_AUTHORISATION:
    jwt_required = lambda refresh=True: (lambda x:x)


# Constants for allowed file types and max file size (optional)
# Define the upload folder path
UPLOAD_FOLDER = 'uploads/'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # Max file size (16MB)

# Allowed file types (for example, only PDF files)
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

    # Set the max content length for request files globally
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

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

def allowed_file(filename):
    """
    Argument: A string filename

    Returns: A boolean indicating if the file extension is within the constant allowed extensions 
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


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

@app.route('/upload_pdf', methods=['POST'])
@jwt_required()
def upload_pdf():
    """
    Arguments: A pdf file

    Purpose: Stores the document in the constant UPLOAD_FOLDER directory as well as adding it's metadata to the database so it can be stored against a user ID
    """
    # Ensure user is authenticated and get the user ID from the JWT
    user_id = get_jwt_identity()

    # Find the user by their ID
    user = User.query.filter_by(UserID=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get the file from the request
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    # Check if the file has a valid extension
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PDF files are allowed."}), 400

    # Generate a secure filename for the file
    filename = secure_filename(file.filename)

    # Create a unique filename to avoid overwriting
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Save the file to the server's file system
    file.save(file_path)

    # Create a new Document instance
    document = Document(
        Name=filename,  # Safe filename for the document
        FilePath=file_path,  # Save the file path in the database
        UserID=user.UserID  # Associate with the user
    )

    # Add to the session and commit
    db.session.add(document)
    db.session.commit()

    # Return a response with document details
    return jsonify({
        "success": True,
        "message": "PDF uploaded successfully",
        "document_name": document.Name,
        "document_id": document.DocumentID,
        "file_path": file_path  # Optionally, return the file path or URL
    }), 200

@app.route('/upload_pdf_temp', methods=['POST'])
def upload_pdf_temp():
    """
    Arguments: A pdf file

    Purpose: Stores the document in the constant UPLOAD_FOLDER directory as well as adding it's metadata to the database so it can be stored against a temporary user ID before the user is registered
    """
    # Generate a temporary user ID for the "disabled" user
    temp_user_id = uuid.uuid4()  # Generate a unique TempUserID

    # Get the file from the request
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file provided"}), 400

    # Check if the file has a valid extension
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PDF files are allowed."}), 400

    # Generate a secure filename for the file
    filename = secure_filename(file.filename)

    # Save the file to the server's file system
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Create a new Document instance with TempUserID
    document = Document(
        Name=filename,
        FilePath=file_path,
        TempUserID=temp_user_id  # Associate with TempUserID
    )

    db.session.add(document)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "PDF uploaded successfully",
        "temp_user_id": str(temp_user_id),  # Return the TempUserID for frontend use
        "document_name": document.Name,
        "document_id": document.DocumentID,
        "file_path": file_path
    }), 200

@app.route('/link_document_to_user', methods=['POST'])
@jwt_required()
def link_document_to_user():
    """
    Arguments: A temporary User ID

    Purpose: Links a document to a user ID by searching for the document linked to the temporary User ID
    """
    user_id = get_jwt_identity()  # Get the user ID from the JWT
    temp_user_id = request.json.get('tempUserId')  # TempUserID passed from frontend
    # Find the document associated with the TempUserID
    document = Document.query.filter_by(TempUserID=temp_user_id).first()
    if document:
        document.UserID = user_id  # Link the document to the authenticated user
        db.session.commit()
        return jsonify({"success": True, "message": "Document linked to user successfully"}), 200
    else:
        return jsonify({"error": "Document not found or already linked"}), 404



@app.route('/view_pdf', methods=['GET'])
@jwt_required()
def view_pdf():
    """
    Arguments: None

    Purpose: Searches the database for the document linked to the user's ID
    """
    ### ASSUMPTION: User's have only one document

    # Ensure user is authenticated and get the user ID from the JWT
    user_id = get_jwt_identity()

    # Find the user by their ID
    user = User.query.filter_by(UserID=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

      # Find the document by document_id
    document = Document.query.filter_by(UserID=user.UserID).first()
    if not document:
        return jsonify({"error": "Document not found"}), 404

    # Get the file path
    file_path = document.FilePath

    # Check if the file exists
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found on the server"}), 404

    # Return the PDF file
    try:
        return send_file(file_path, as_attachment=False, mimetype='application/pdf')
    except Exception as e:
        return jsonify({"error": f"Error sending file: {str(e)}"}), 500
    

@app.route("/login", methods=["POST"])
def login():
    """
    Arguments: A string email and password

    Purpose: Allows user's to login by providing them an access and refresh token after confirming that their password matches that of the User in the database with the same email
    """
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


@app.route("/user-info", methods=["GET", "OPTIONS"])
@jwt_required()
def get_user_info():
    """
    Arguments: None

    Purpose: Returns the user ID, role, name and email
    """
    if request.method == "OPTIONS":
        return "", 200  # Respond to OPTIONS request

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
    """
    Arguments: name, email, password, hasDisability, temp_user_id

    Purpose: Check that the user's email does not already exist in the database, check their password and email, their role and if they have uploaded a supporting document. Then creates the user in the database.
    """
    data = request.get_json()
    email = sanitise_input(data.get("email", ""))
    name = sanitise_input(data.get("name", ""))
    password = data.get("password", "")
    hasDisability = data.get("hasDisability", "")
    temp_user_id = data.get("tempUserId","")

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

    # If the user is registering as disabled, check to see if they have uploaded a document
    if role == "Disabled":
        document = db.session.query(Document).filter_by(TempUserID=temp_user_id).first()
        if not temp_user_id or not document:
            return jsonify({"message": "User has not uploaded a document", "success": False}), 400

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
    """
    Arguments: None

    Purpose: Clears the user's cookies and logs them out
    """
    response = make_response(
        jsonify({"message": "Logout successful", "success": True}), 200
    )

    # Clear access and refresh tokens from cookies
    response.set_cookie("access_token", "", expires=0)
    response.set_cookie("refresh_token", "", expires=0)

    return response


### TODO: FRONTEND NEEDS TO REFRESH ACCESS TOKENS EVERY HOUR OR EVERYTIME IT EXPIRES (DONE)
@app.route("/refresh")
@jwt_required(refresh=True)
def refresh():
    """
    Arguments: None

    Purpose: Creates a new access and refresh token for the user when called
    """
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

@app.route("/see_reservation", methods=["GET"])
@jwt_required()
def see_reservation():
    """
    Arguments: None

    Purpose: Allows the user to see all reservations
    """
    userID = get_jwt_identity()
    
    user = db.session.query(User).filter_by(UserID=userID).first()
    if not user:
        return jsonify({"message": "User not found."}), 404

    role = user.Role
    print(f"see_reservation userID={userID},role={role},{Roles.VOLUNTEER},isVolunteer={role=='Volunteer'}")
    
    if role not in ["Volunteer", "Disabled"]:
        return jsonify({"message": f"Unexpected role '{role}'."}), 400
    
    reservations = (
        db.session.query(Reservations)
        .join(VolunteerReservation, Reservations.ReservationID == VolunteerReservation.ReservationID)
        .filter(VolunteerReservation.UserID == userID)
        .all()
    ) if role == "Volunteer" else (
        db.session.query(Reservations)
        .join(UserReservation, Reservations.ReservationID == UserReservation.ReservationID)
        .filter(UserReservation.UserID == userID)
        .all()
    )

    print(f"reservations={reservations}")

    # if len(reservations) != 1:
    #     return jsonify({"message": f"Got {len(reservations)} reservations, but expected length 1."}), 400

    res = reservations[0]

    reservations_dict = {
        "ReservationID": res.ReservationID,
        "StopID1": res.StopID1,
        "StopID2": res.StopID2,
        "BusID": res.BusID,
        "Time": res.Time,
        "VolunteerCount": res.VolunteerCount,
    }

    data = get_reservation_data(reservations_dict)
    if data is None:
        return jsonify({"message": "Could not fetch timetables."}), 400
    
    reservations_dict |= data
    return jsonify({"role": role, "reservations": reservations_dict}), 200
    

@app.route("/create_reservation", methods=["POST"])
@jwt_required()  # Protect th\is route
def create_reservation():
    """
    Arguments: stopID1, stopID2, busID, time, VolunteerCount

    Purpose: Allows the user to create a reservation if there is no matching reservation already existing
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
        .filter(Reservations.Time == time, Reservations.BusID == busID)  # Check against Time and busID
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
        print(f"Created reservation {new_reservation}")
        return jsonify(
            {
                "message": "Reservation created successfully",
                "reservation_id": new_reservation.ReservationID,
                "success": True,
            }
        ), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500
    
@app.route("/add_volunteer", methods=["POST"])
@jwt_required()  # Protect this route
def add_volunteer():
    """
    Arguments: reservationID

    Purpose: Allows the volunteers to be added to the reservation
    """
    data = request.get_json()

    reservationID = data.get("ReservationID", "")

    userID = get_jwt_identity()

    # Get the user object to check the role
    user = db.session.query(User).filter_by(UserID=userID).first()
    print(f"userRole={user.Role}")
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
        ), 200
    

    # Find reservation to add the user
    # If we get reservation ID from frontend we can check with reservation ID instead
    reservation = db.session.query(Reservations).filter_by(ReservationID = reservationID).first()

    if not reservation:
        return jsonify({"message":"Reservation not found."}), 200
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
                "success": True,
            }
        ), 201
    
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500
        
@app.route("/remove_volunteer", methods=["POST"])
@jwt_required()
def remove_volunteer():  
    """
    Arguments: reservationID

    Purpose: Allows the volunteers to be removed from the reservation
    """
    data = request.get_json()

    reservationID = data.get("ReservationID", "")
    userID = get_jwt_identity()

    try:
        reservation = db.session.query(Reservations).filter_by(ReservationID = reservationID).first()
        volunteerReservation = db.session.query(VolunteerReservation).filter_by(UserID=userID, ReservationID=reservationID).first()

        if not reservation:
            return jsonify({"message":"Reservation not found."}), 200
        
        if not volunteerReservation:
            return jsonify({"message":"Reservation not found."}), 200
        
        reservation.VolunteerCount -= 1
        db.session.delete(volunteerReservation)

        db.session.commit()

        return jsonify({"message": "Volunteer removed from the reservation successfully.", "success": True}), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"error": str(e)}), 500

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
    """
    Arguments: None

    Purpose: Deletes all of the user's reservations
    """
    try:
        userID = get_jwt_identity()

        # Find the most recent reservation for the user to delete
        reservations = (
            db.session.query(Reservations)
            .join(UserReservation)
            .filter(UserReservation.UserID == userID)
            .order_by(Reservations.Time.desc())
            .all()
        )

        # if not reservations:
            # return jsonify({"message": "No reservations found for this user."}), 404

        for reservation in reservations:
            # Delete the reservation
            db.session.delete(reservation)
        
        db.session.commit()

        return jsonify({"message": "Reservations deleted successfully.", "success": True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/change_password", methods=["POST"])
@jwt_required()
def change_password():
    """
    Arguments: newPassword

    Purpose: Allows the user to change their password as long as it is strong enough
    """
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
    """
    Arguments: name, email and currentPassword

    Purpose: Allows the user to change their name and email as long as it follows the correct format and their current password is correct
    """
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
