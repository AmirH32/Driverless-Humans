from flask import Flask
from data.read import get_timetables
from datetime import datetime
from typing import List, Dict, Any

app = Flask(__name__)

@app.route('/timetables')
def timetables() -> List[Dict[str, Any]]:
    """
    Gets bus timetables
    """
    
    timetables = get_timetables()

    return [
        timetable | {
            "arrival_min": (datetime.strptime(timetable['arrival_time'],"%Y-%m-%dT%H:%M:%S.%f") - datetime.now()).total_seconds() // 60
        }
        for timetable in timetables
    ]

if __name__ == '__main__':
    app.run(debug=True)