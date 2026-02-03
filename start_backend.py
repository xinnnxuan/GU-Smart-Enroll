import os
import sys
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the prerequisite service
from my_app.back_end.services.prereq_service import build_prerequisite_graph

@app.route('/prereq_bp/graph', methods=['GET'])
def get_prerequisite_graph():
    course_code = request.args.get('course')
    include_all_levels = request.args.get('all', 'true').lower() == 'true'

    if not course_code:
        return jsonify({'error': 'Course code is required'}), 400

    try:
        # Call the prerequisite service
        graph_data = build_prerequisite_graph(course_code, include_all_levels)
        return jsonify(graph_data)
    except Exception as e:
        print(f"Error getting prerequisite graph: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting the backend server on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
    