"""
Functions to process and return data
"""

import os
from datetime import datetime
import pandas as pd
from .fetch import fetch_location_data, fetch_stops_data
from .utils import gridreference_to_latlong, calc_coord_distance

AVERAGE_BUS_SPEED = 21 # kmph
CAMBRIDGE_BOUNDING_BOX = (0.0800,52.1700,0.1600,52.2300) # Cambridge
STOPS_DATA_FILENAME = 'stops.csv'

def get_location_data(route_id, bounding_box=CAMBRIDGE_BOUNDING_BOX):
	data = fetch_location_data(
		api_key=os.getenv('BODS_API_KEY'),
		route_id=route_id,
		bounding_box=bounding_box
	)
	data = data.get("Siri",{}).get("ServiceDelivery",{}).get("VehicleMonitoringDelivery",{}).get("VehicleActivity",{})
	print(data)
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
	
def save_stops_data(filename):
	df = fetch_stops_data()
	assert (df.GridType.unique()=='UKOS').all()

	df[['Latitude', 'Longitude']] = df.apply(lambda row:gridreference_to_latlong(row['Easting'],row['Northing']),axis=1,result_type='expand')
	df = df[['ATCOCode','CommonName', 'Latitude', 'Longitude']]
	df = df.rename(columns={'ATCOCode':'id','CommonName':'name', 'Latitude':'latitude', 'Longitude':'longitude'})
	df.to_csv(filename,index=False)
	return df

def get_stops_data(filename):
	if not os.path.exists(filename):
		save_stops_data(filename)
	df = pd.read_csv(filename,index_col='id')
	return df

def get_bus_status(vehicle_id):
	return {'seats_empty': 1, 'ramp_type':'MANUAL'}

def get_timetables(stop_id, route_id):
	bus_locations = get_location_data(route_id=route_id)

	df = get_stops_data(STOPS_DATA_FILENAME)
	stop_latlong = tuple(df.loc[stop_id,['latitude','longitude']])
	
	bus_locations['distance'] = bus_locations.apply(lambda row: calc_coord_distance((row['latitude'],row['longitude']),stop_latlong), axis=1)
	bus_locations['arrival_min'] = bus_locations['distance'] / AVERAGE_BUS_SPEED * 60
	bus_locations['arrival_time'] = bus_locations['time'] + pd.to_timedelta(bus_locations['arrival_min'], unit='m')
	
	bus_status_df = bus_locations.apply(lambda row: pd.Series(get_bus_status(row['vehicle_id'])), axis=1)
	bus_locations = pd.concat([bus_locations, bus_status_df], axis=1)
	
	bus_locations[['route_id','route_name']] = route_id
	
	return bus_locations
