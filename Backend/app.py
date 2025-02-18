from dotenv import load_dotenv
from Backend.bus_data import get_timetables
import pandas as pd
from flask import Flask, request, jsonify
from Backend.data.models import db, User
from datetime import datetime
from typing import List, Dict, Any
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from Backend.authorisation.auth import verify_password, init_jwt
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

load_dotenv()

### App configuration

app = Flask(__name__)

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
    email = data.get('email')
    name = data.get('name')
    password = data.get('password')

    # Make sure email and password fields are filled
    if not email or not password:
        return jsonify({'message': 'Email and password are required', 'success': False}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(Email=email).first()
    if existing_user:
        return jsonify({'message': 'User already exists', 'success': False}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(Email=email, Password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    # Hash the password and store the user
    return jsonify({'message': 'User created successfully', 'success': True}), 201



if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/timetables?stop_id=0500CCITY424