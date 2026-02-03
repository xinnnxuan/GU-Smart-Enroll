import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from controllers.user_controller import user_bp
from controllers.course_controller import course_bp
from controllers.export_controller import export_bp
from controllers.prereq_controller import prereq_bp
from controllers.section_controller import section_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(user_bp, url_prefix='/user_bp')
app.register_blueprint(course_bp, url_prefix='/courses_bp')
app.register_blueprint(section_bp, url_prefix='/sections_bp')
app.register_blueprint(export_bp, url_prefix='/export_bp')
app.register_blueprint(prereq_bp, url_prefix='/api_bp')

INTERFACE_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'interface')

@app.route('/')
def serve_index():
    return send_from_directory(INTERFACE_FOLDER, 'index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(INTERFACE_FOLDER, filename)

@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory(INTERFACE_FOLDER, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)

