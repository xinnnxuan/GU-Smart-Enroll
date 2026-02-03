from flask import Blueprint, jsonify
from services.database_service import DatabaseService

db_bp = Blueprint('db_bp', __name__)

@db_bp.route('/courses', methods=['GET'])
def get_courses():
    """
    API endpoint to get all courses from the database
    """
    try:
        courses = DatabaseService.get_courses()
        if courses is None:
            return jsonify({
                'error': 'Database Error',
                'message': 'Failed to retrieve courses from the database'
            }), 500
        
        return jsonify({
            'data': courses,
            'count': len(courses)
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': str(e)
        }), 500

@db_bp.route('/sections/<course_id>', methods=['GET'])
def get_sections(course_id):
    """
    API endpoint to get all sections for a specific course
    """
    try:
        sections = DatabaseService.get_sections(course_id)
        if sections is None:
            return jsonify({
                'error': 'Database Error',
                'message': f'Failed to retrieve sections for course {course_id}'
            }), 500
        
        return jsonify({
            'data': sections,
            'count': len(sections)
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': str(e)
        }), 500

@db_bp.route('/professors', methods=['GET'])
def get_professors():
    """
    API endpoint to get all professors from the database
    """
    try:
        professors = DatabaseService.get_professors()
        if professors is None:
            return jsonify({
                'error': 'Database Error',
                'message': 'Failed to retrieve professors from the database'
            }), 500
        
        return jsonify({
            'data': professors,
            'count': len(professors)
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Server Error',
            'message': str(e)
        }), 500 