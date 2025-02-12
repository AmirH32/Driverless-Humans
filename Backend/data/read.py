import json
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import List, Dict, Any
from data.models import Timetable
from data.generate import save_timetables, TIMETABLE_FILENAME

def get_timetables() -> List[Dict[str, Any]]:
    save_timetables(TIMETABLE_FILENAME)
    with open(TIMETABLE_FILENAME, 'r') as f:
        timetables = json.load(f)
    return timetables
