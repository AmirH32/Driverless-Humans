from Backend.database.models import db, Reservations
from Backend.data.stops import get_stops_data
from Backend.data.utils import calc_coord_distance
from Backend.data.timetables import get_timetables
from Backend.data.models import Timetable
import pandas as pd

def get_reservation_data(res, latlong=None):
    """
    Takes dict of ReservationID, StopID1, StopID2, BusID, Time, VolunteerCount
    """
    
    timetables = get_timetables(origin_id=res["StopID1"],destination_id=res["StopID2"])
    
    if len(timetables) == 0:
        return None

    timetable = timetables[0].model_dump(mode='json')
    
    if latlong is not None: # calculate distance
        latlongs_df = get_stops_data().reset_index()
        stop = latlongs_df.loc[latlongs_df.id == res["StopID1"]].iloc[0]
        distance = calc_coord_distance((stop["latitude"], stop["longitude"]), latlong)
        timetables["distance"] = distance

    return timetable