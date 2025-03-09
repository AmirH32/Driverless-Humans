from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash

db = SQLAlchemy()


class User(db.Model):
    UserID = db.Column(db.Integer, primary_key=True, unique=True)
    Email = db.Column(db.String(150), unique=True, nullable=False)
    Password = db.Column(db.String(150), nullable=False)
    Name = db.Column(db.String(150), nullable=False)
    Salt = db.Column(db.CHAR(128), nullable=False)
    Role = db.Column(db.String(16), nullable=False)

    def verify_password(self, password):
        if check_password_hash(self.Password, password + self.Salt):
            return True
        else:
            return False


class AccessibilityRequirement(db.Model):
    __tablename__ = "accessibilityrequirement"
    RequirementID = db.Column(db.Integer, primary_key=True, unique=True)
    Requirement_name = db.Column(db.String(100), unique=False, nullable=False)
    Description = db.Column(
        db.String(255), unique=False, nullable=True
    )  # Optional description for the requirement


class UserAccessibility(db.Model):
    __tablename__ = "User_Accessibility"
    # Cascade delete so if we delete a user or an accessibility all associated records are automatically deleted
    UserID = db.Column(
        db.Integer,
        db.ForeignKey("user.UserID", ondelete="CASCADE"),
        primary_key=True,
    )
    RequirementID = db.Column(
        db.Integer,
        db.ForeignKey("accessibilityrequirement.RequirementID", ondelete="CASCADE"),
        primary_key=True,
    )


class Reservations(db.Model):
    ReservationID = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    StopID1 = db.Column(db.String, nullable=False)
    StopID2 = db.Column(db.String, nullable=False)
    BusID = db.Column(db.String, nullable=False)
    VolunteerCount = db.Column(db.Integer, nullable=False)
    Time = db.Column(db.DateTime, nullable=False)

    def init(self, StopID1, StopID2, BusID, Time, VolunteerCount):
        self.StopID1 = StopID1
        self.StopID2 = StopID2
        self.BusID = BusID
        self.Time = Time
        self.VolunteerCount = VolunteerCount

class VolunteerReservation(db.Model):
    __tablename__ = "Volunteer_to_Reservation"
    UserID = db.Column(db.Integer, db.ForeignKey("user.UserID", ondelete="CASCADE"))
    ReservationID = db.Column(
        db.Integer,
        db.ForeignKey("reservations.ReservationID", ondelete="CASCADE"),
        primary_key = True
    )
    

class UserReservation(db.Model):
    __tablename__ = "User_to_Reservation"
    UserID = db.Column(db.Integer, db.ForeignKey("user.UserID", ondelete="CASCADE"))
    ReservationID = db.Column(
        db.Integer,
        db.ForeignKey("reservations.ReservationID", ondelete="CASCADE"),
        primary_key=True,
        autoincrement=True
    )


class AccessibilityOptions(db.Model):
    __tablename__ = "Accessibility_Options"
    OptionID = db.Column(db.Integer, primary_key=True, unique=True)
    Option_name = db.Column(db.String(120), unique=True, nullable=False)
    Option_description = db.Column(db.String(255), unique=False, nullable=True)


class UserToOptions(db.Model):
    __tablename__ = "User_to_AOptions"
    UserID = db.Column(
        db.Integer,
        db.ForeignKey("user.UserID", ondelete="CASCADE"),
        primary_key=True,
    )
    OptionID = db.Column(
        db.Integer,
        db.ForeignKey("Accessibility_Options.OptionID", ondelete="CASCADE"),
        primary_key=True,
        unique=True,
    )
