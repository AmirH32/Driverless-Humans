import requests
import xmltodict
import os
from datetime import datetime
import pandas as pd

from .stops import get_stops_data
from .utils import calc_coord_distance
from .models import Timetable

AVERAGE_BUS_SPEED = 21 # kmph
CAMBRIDGE_BOUNDING_BOX = (0.0800,52.1700,0.1600,52.2300) # Cambridge

def fetch_location_data(route_id, bounding_box=CAMBRIDGE_BOUNDING_BOX):
	"""
	Fetches real-time bus data from the Bus Open Data API.
	Args:
		api_key (str): API key for authentication.
		route_id (str): Route identifier, e.g., 'U1'.
		bounding_box (tuple): Bounding box coordinates as (minLongitude, minLatitude, maxLongitude, maxLatitude).

	Returns:
		dict: Bus data in JSON format if the request is successful.
		None: If the request fails.
	"""

	api_key = os.getenv('BODS_API_KEY')
	
	url = 'https://data.bus-data.dft.gov.uk/api/v1/datafeed/'
	params = {
		'api_key': api_key,
		'lineRef': route_id,
		'boundingBox': ','.join(map(str,bounding_box))
	}
	response = requests.get(url, params=params)

	if response.status_code == 200:
		return xmltodict.parse(response.content)
	else:
		print(f"Error: {response.status_code} - {response.text}")
		return None

def get_location_df(route_id) -> pd.DataFrame:
	data = fetch_location_data(route_id=route_id)
	data = data.get("Siri",{}).get("ServiceDelivery",{}).get("VehicleMonitoringDelivery",{}).get("VehicleActivity",{})

	if type(data) != list:
		data = [data]
	
	locations = []
	for bus in data:
		time = datetime.strptime(bus['RecordedAtTime'], '%Y-%m-%dT%H:%M:%S%z')

		journey = bus['MonitoredVehicleJourney']
		vehicle_id = journey['VehicleRef']

		latlong = journey['VehicleLocation']
		latitude = float(latlong['Latitude'])
		longitude = float(latlong['Longitude'])

		locations.append({
			'time':time,
			'vehicle_id':vehicle_id,
			'latitude':latitude,
			'longitude':longitude
		})
	return pd.DataFrame(locations)
	

def get_bus_status(vehicle_id):
	return {'seats_empty': 1, 'ramp_type':'MANUAL'}

def get_timetables_by_stop_and_route(stop_id, route_id):
	bus_locations = get_location_df(route_id=route_id)

	df = get_stops_data()
	stop_latlong = tuple(df.loc[stop_id,['latitude','longitude']])
	
	bus_locations['distance'] = bus_locations.apply(lambda row: calc_coord_distance((row['latitude'],row['longitude']),stop_latlong), axis=1)
	bus_locations['arrival_min'] = bus_locations['distance'] / AVERAGE_BUS_SPEED * 60
	bus_locations['arrival_time'] = bus_locations['time'] + pd.to_timedelta(bus_locations['arrival_min'], unit='m')
	bus_locations['arrival_time'] = bus_locations['arrival_time'].apply(lambda x: x.isoformat())

	bus_status_df = bus_locations.apply(lambda row: pd.Series(get_bus_status(row['vehicle_id'])), axis=1)
	bus_locations = pd.concat([bus_locations, bus_status_df], axis=1)
	
	bus_locations[['route_id','route_name']] = route_id
	
	return bus_locations

def get_routes(stop_id: str) -> list[str]:
	lookup = {
		'0500CCITY424': ['U1', 'U2']
	}
	return lookup.get(stop_id, [])

def get_timetables(stop_id: str) -> list[Timetable]:
    route_ids = get_routes(stop_id)
    
    timetables = []
    for route_id in route_ids:
        route_timetables = get_timetables_by_stop_and_route(stop_id, route_id)

        if len(route_timetables) == 0:
            continue

        route_timetables.sort_values(by='arrival_min', inplace=True)
    
        # Earliest bus along this route
        nextbus = route_timetables.iloc[0]
		
        # Timetable object
        timetable = Timetable(**nextbus.to_dict())
		
        timetables.append(timetable)
    
    return timetables