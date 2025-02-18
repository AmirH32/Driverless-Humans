from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal
from flask_sqlalchemy import SQLAlchemy

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
    
    def get_id(self):
        # Returns the User's ID
        return self.UserID
    
class AccessibilityRequirement(db.Model):
    RequirementID = db.Column(db.Integer, primary_key=True, unique=True)
    Requirement_name = db.Column(db.String(100), unique=False, nullable=False)
    Description = db.Column(db.String(255), unique=False, nullable=True)  # Optional description for the requirement

class UserAccessibility(db.Model):
    __tablename__ = 'User_Accessibility'
    # Cascade delete so if we delete a user or an accessibility all associated records are automatically deleted
    UserID = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True, unique=True)
    RequirementID = db.Column(db.Integer, db.ForeignKey('accessibility_requirement.id', ondelete='CASCADE'), primary_key=True, unique=True)
    