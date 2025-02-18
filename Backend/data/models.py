from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash

class Timetable(BaseModel):
    route_id    : int
    route_name  : str
    arrival_time: datetime
    seats_empty : int
    ramp_type   : Literal['NONE', 'MANUAL', 'AUTO']

db = SQLAlchemy()

class User(db.Model):
    UserID = db.Column(db.Integer, primary_key=True, unique=True)
    Email = db.Column(db.String(150), unique=True, nullable=False)
    Password = db.Column(db.String(150), nullable=False)
    Name = db.Column(db.String(150), nullable=False)
    Salt = db.Column(db.CHAR(16), nullable=False)
    
    def get_id(self):
        # Returns the User's ID
        return self.UserID
    
    def verify_password(self, password):
        if check_password_hash(self.Password, password + self.Salt):
            return True
        else:
            return False
    
class AccessibilityRequirement(db.Model):
    __tablename__ = 'accessibilityrequirement' 
    RequirementID = db.Column(db.Integer, primary_key=True, unique=True)
    Requirement_name = db.Column(db.String(100), unique=False, nullable=False)
    Description = db.Column(db.String(255), unique=False, nullable=True)  # Optional description for the requirement

class UserAccessibility(db.Model):
    __tablename__ = 'User_Accessibility'
    # Cascade delete so if we delete a user or an accessibility all associated records are automatically deleted
    UserID = db.Column(db.Integer, db.ForeignKey('user.UserID', ondelete='CASCADE'), primary_key=True, unique=True)
    RequirementID = db.Column(db.Integer, db.ForeignKey('accessibilityrequirement.RequirementID', ondelete='CASCADE'), primary_key=True, unique=True)
    
class Reservations(db.Model):
    ReservationID = db.Column(db.Integer, primary_key=True, unique=True)
    StopID1 = db.Column(db.Integer, nullable=False)
    StopID2 = db.Column(db.Integer, nullable=False)
    BusID = db.Column(db.Integer, nullable=False)
    time = db.Column(db.DateTime, nullable=False) 

class UserReservation(db.Model):
    __tablename__ = "User_to_Reservation"
    UserID = db.Column(db.Integer, db.ForeignKey('user.UserID', ondelete='CASCADE'), primary_key=True, unique=True)
    ReservationID = db.Column(db.Integer, db.ForeignKey('reservations.ReservationID', ondelete='CASCADE'), primary_key=True, unique=True)


class AccessibilityOptions(db.Model):
    __tablename__ = "Accessibility_Options"
    OptionID = db.Column(db.Integer, primary_key=True, unique=True)
    Option_name = db.Column(db.String(120), unique=True, nullable=False)
    Option_description = db.Column(db.String(255), unique=False, nullable=True)  

class UserToOptions(db.Model):
    __tablename__ = "User_to_AOptions"
    UserID = db.Column(db.Integer, db.ForeignKey('user.UserID', ondelete='CASCADE'), primary_key=True, unique=True)
    OptionID = db.Column(db.Integer, db.ForeignKey('Accessibility_Options.OptionID', ondelete='CASCADE'), primary_key=True, unique=True)
    