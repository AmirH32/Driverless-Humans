from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class Timetable(BaseModel):
    route_id: str
    route_name: str
    arrival_time: datetime
    seats_empty: int
    ramp_type: Literal["NONE", "MANUAL", "AUTO"]
    vehicle_id: str


class Autocompletion(BaseModel):
    id: str
    name: str
    street: str
