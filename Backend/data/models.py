from datetime import datetime
from pydantic import BaseModel, Field
from typing import Literal

class Timetable(BaseModel):
    route_id    : int
    route_name  : str
    arrival_time: datetime
    seats_empty : int
    ramp_type   : Literal['NONE', 'MANUAL', 'AUTO']
