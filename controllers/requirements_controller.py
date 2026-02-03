from flask import Blueprint, request, jsonify
from services.requirements_service import get_merged_requirements_for_student

requirements_bp = Blueprint('requirements_bp', __name__)

@requirements_bp.route('/student-requirements', methods=['GET'])
def get_student_requirements():
    """
    Get merged core and major requirements for a student.
    
    Query Parameters:
        student_id: int - The student ID
        major_program: str - The major program name
        core_program: str (optional) - The core program name (defaults to "University Core Requirements")
        
    Returns:
        JSON with core and major requirements
    """
    try:
        student_id = request.args.get('student_id')
        major_program = request.args.get('major_program')
        core_program = request.args.get('core_program', 'University Core Requirements')
        
        if not student_id or not major_program:
            return jsonify({
                'error': 'Missing required parameters',
                'message': 'student_id and major_program are required'
            }), 400
            
        try:
            student_id = int(student_id)
        except ValueError:
            return jsonify({
                'error': 'Invalid parameter',
                'message': 'student_id must be an integer'
            }), 400
        
        result = get_merged_requirements_for_student(
            student_id=student_id,
            major_program_name=major_program,
            core_program_name=core_program,
            full_view=False,
            debug=False
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        # Log the error
        print(f"Error getting student requirements: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while retrieving student requirements'
        }), 500 