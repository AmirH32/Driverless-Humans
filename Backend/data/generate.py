import json
from data.models import Timetable
from datetime import datetime, timedelta
from typing import List

TIMETABLE_FILENAME = "data/timetables.json"

def save_timetables(filename: str) -> List[Timetable]:
    now = datetime.now()
    timetables = [
        Timetable(route_id=0, route_name="U1", arrival_time=now+timedelta(minutes=5 ), seats_empty=1, ramp_type="NONE"  ),
        Timetable(route_id=1, route_name="U2", arrival_time=now+timedelta(minutes=10), seats_empty=0, ramp_type="MANUAL"),
        Timetable(route_id=2, route_name="U3", arrival_time=now+timedelta(minutes=15), seats_empty=2, ramp_type="AUTO"  ),
    ]
    
    timetables_json = [timetable.model_dump(mode='json') for timetable in timetables]
    
    with open(filename, 'w') as file:
        json.dump(timetables_json, file, indent=4)

if __name__ == "__main__":
    save_timetables(TIMETABLE_FILENAME)