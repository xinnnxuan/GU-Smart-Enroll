
from flask import Blueprint, request, jsonify
from services.user_service import create_user, check_login, add_class_enrollment, get_user_enrollments
from .combo import get_merged_requirements_for_student, plan_next_semester_bruteforce
import re
from .get_prerequisites_utils import get_course_prerequisites

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_name = data.get('user_name')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not user_name or not email or not password or not name:
        return jsonify({"error": "Missing required fields (user_name, email, password, name)"}), 400

    result = create_user(user_name, email, password, name)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_name = data.get('user_name')
    password = data.get('password')

    if not user_name or not password:
        return jsonify({"error": "Missing user_name or password"}), 400

    result = check_login(user_name, password)
    if "error" in result:
        return jsonify(result), 401
    return jsonify(result), 200

@user_bp.route('/add_class', methods=['POST'])
def add_class():
    data = request.get_json()
    result = add_class_enrollment(
        user_id=data.get('user_id'),
        in_process=data.get('in_process', False),
        section_id=data.get('section_id'),
        crn=data.get('crn'),
        course_id=data.get('course_id'),
        term=data.get('term'),
        section=data.get('section')
    )
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result), 200

@user_bp.route('/<int:user_id>/enrollments', methods=['GET'])
def get_user_enrollments_route(user_id):
    result = get_user_enrollments(user_id)
    return jsonify(result)

@user_bp.route('/<int:user_id>/next_requirements', methods=['GET'])
def get_next_requirements(user_id):
    major = request.args.get('major', 'B.S. Computer Science - Data Science Concentration')
    core = request.args.get('core', 'University Core Requirements')
    result = get_merged_requirements_for_student(
        student_id=user_id,
        major_program_name=major,
        core_program_name=core,
        full_view=False,
        debug=False
    )
    return jsonify(result)

@user_bp.route('/<int:user_id>/next_semester_plan', methods=['GET'])
def get_next_semester_plan(user_id):
    major = request.args.get('major', 'B.S. Computer Science - Data Science Concentration')
    core = request.args.get('core', 'University Core Requirements')
    term = request.args.get('term', 'Fall 2025')
    max_credits = int(request.args.get('max_credits', 18))
    plan = plan_next_semester_bruteforce(
        student_id=user_id,
        major_program_name=major,
        core_program_name=core,
        next_term=term,
        max_credits_per_semester=max_credits,
        debug=True
    )
    return jsonify(plan)

def get_course_level(course_code):
    m = re.match(r"([A-Z]+)\s*(\d+)", course_code)
    if not m:
        return None, None
    subject = m.group(1)
    number = int(m.group(2))
    level = (number // 100) * 100
    return subject, level

def has_lower_level_course(student_courses, subject, level):
    if level < 200:
        return True
    required_level = level - 100
    for code in student_courses:
        subj, lvl = get_course_level(code)
        if subj == subject and lvl == required_level:
            return True
    return False

def get_lab_pair(course_code):
    import re
    m = re.match(r"([A-Z]+)\\s*(\\d+)(L?)", course_code)
    if not m:
        return None
    subject = m.group(1)
    number = m.group(2)
    is_lab = m.group(3) == "L"
    if is_lab:
        return f"{subject} {number}"
    else:
        return f"{subject} {number}L"

