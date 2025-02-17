"""
Functions to request data from the Bus Open Data Service (BODS) API and NaPTAN API
"""

import requests
import xmltodict
import pandas as pd
from io import StringIO

def fetch_location_data(api_key, route_id, bounding_box):
	"""
	Fetches real-time bus data from the Bus Open Data API.

	@param api_key: str
	@param lineRef: str, e.g. U1
	@param boundingBox: tuple, (minLongitude, minLatitude, maxLongitude, maxLatitude)

	@return: dict, bus data in JSON format
	"""
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

def fetch_stops_data():
	"""
	Fetches bus stop data from the NaPTAN API and saves it in a CSV file.

	@param filename: str, where to save the CSV

	@return: DataFrame, bus data in JSON format
	"""
	url = 'https://naptan.api.dft.gov.uk/v1/access-nodes/'
	params = {
		'atcoAreaCodes': '050', # 050 = Cambridge
		'dataFormat': 'csv'
	}
	response = requests.get(url, params=params)

	if response.status_code == 200:
		return pd.read_csv(StringIO(response.text))
	else:
		print(f"Error: {response.status_code} - {response.text}")
		return None