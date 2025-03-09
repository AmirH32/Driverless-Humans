from Backend.database.models import db, Reservations

def filter_reservations(reservation_id=None):
    if reservation_id is None:
        reservations = db.session.query(Reservations).all()
    else:
        
    reservations = (
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
