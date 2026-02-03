from flask import Blueprint, jsonify
from datetime import datetime, timedelta

export_bp = Blueprint('export_bp', __name__)

@export_bp.route('/apple-calendar', methods=['POST'])
def export_to_apple_calendar():
    try:
        return jsonify({"success": "Calendar export initiated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@export_bp.route('/google-calendar', methods=['POST'])
def export_to_google_calendar():
    try:
        return jsonify({"success": "Calendar export initiated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500 