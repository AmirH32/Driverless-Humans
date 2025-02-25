from geopy.distance import geodesic
from pyproj import Transformer


def calc_coord_distance(latlong1, latlong2):
    """
    Calculates the straight-line distance between two pairs of (latitude, longitude) coordinates.

    @param latlong1: tuple, (latitude, longitude)
    @param latlong2: tuple, (latitude, longitude)

    @return: float, the distance between latlong1 and latlong2 in kilometres
    """
    return geodesic(latlong1, latlong2).kilometers


def gridreference_to_latlong(easting, northing):
    return Transformer.from_crs("epsg:27700", "epsg:4326").transform(easting, northing)
