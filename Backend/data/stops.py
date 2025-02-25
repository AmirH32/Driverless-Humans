import requests
import os
import pandas as pd
from io import StringIO
from rapidfuzz import fuzz

from .utils import gridreference_to_latlong
from .models import Autocompletion

STOPS_DATA_FILENAME = 'data/stops.csv'

def fetch_stops_data():
	"""
	Fetches bus stop data from the NaPTAN API and saves it in a CSV file.

	@param filename: str, where to save the CSV

	@return: DataFrame, bus data in JSON format
	"""
	url = 'https://naptan.api.dft.gov.uk/v1/access-nodes/'
	params = {
		'atcoAreaCodes': '050', # Cambridge
		'dataFormat': 'csv'
	}
	response = requests.get(url, params=params)

	if response.status_code == 200:
		return pd.read_csv(StringIO(response.text))
	else:
		print(f"Error: {response.status_code} - {response.text}")
		return None

def save_stops_data(filename=STOPS_DATA_FILENAME):
	df = fetch_stops_data()
	assert (df.GridType.unique()=='UKOS').all()

	df[['Latitude', 'Longitude']] = df.apply(lambda row:gridreference_to_latlong(row['Easting'],row['Northing']),axis=1,result_type='expand')
	df = df[['ATCOCode','CommonName', 'Latitude', 'Longitude', 'Street']]
	df = df.rename(columns={'ATCOCode':'id','CommonName':'name', 'Latitude':'latitude', 'Longitude':'longitude', 'Street':'street'})

	df['street'] = df['street'].fillna(df['name'])

	df.to_csv(filename,index=False)
	return df

def get_stops_data(filename=STOPS_DATA_FILENAME):
	if not os.path.exists(filename):
		save_stops_data(filename)
	df = pd.read_csv(filename,index_col='id')
	return df

def get_autocomplete_stops(name: str, limit: int) -> list[Autocompletion]:
    name = name.lower()
    
    stops = get_stops_data()
    stops['prefix'] = stops['name'].str[:len(name)].str.lower()
    stops['similarity'] = stops.apply(lambda row: fuzz.ratio(row['prefix'], name), axis=1)
    stops.sort_values(by='similarity', ascending=False, inplace=True)
    stops_dict = stops.reset_index()[['id','name','street']].head(limit).to_dict(orient='records')
    return [Autocompletion(**stop) for stop in stops_dict]

if __name__ == '__main__':
	save_stops_data()