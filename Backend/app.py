from flask import Flask, request
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv

# import Backend.bus_data
# import importlib
# importlib.reload(Backend.bus_data)

from Backend.bus_data import get_timetables
import pandas as pd

app = Flask(__name__)

load_dotenv()

@app.route('/timetables')
def timetables() -> List[Dict[str, Any]]:
    """
    Gets bus timetables
    """
    stop_id = request.args.get('stop_id')
    route_ids = ['U1','U2']
    
    all_timetables = []
    for route_id in route_ids:
        timetables = get_timetables(stop_id, route_id)
        if len(timetables) == 0:
            continue
        timetables['arrival_time'] = timetables['arrival_time'].apply(lambda x: x.isoformat())
        timetable = timetables.loc[timetables['arrival_min'].idxmin()]
        all_timetables.append(timetable[['route_id','route_name','arrival_min','arrival_time','seats_empty','ramp_type']])
    
    if all_timetables:
        all_timetables_df = pd.DataFrame(all_timetables)
    else:
        all_timetables_df = pd.DataFrame(columns=['route_id', 'route_name', 'arrival_min', 'arrival_time', 'seats_empty', 'ramp_type'])

    print(all_timetables)
    print(all_timetables_df)
    return all_timetables_df.to_json(orient='records')

if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/timetables?stop_id=0500CCITY424