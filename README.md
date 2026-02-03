# GU Smart Enroll

A comprehensive course registration and schedule management system for Gonzaga University students.

**Live Application:** [https://gu-smart-enroll.onrender.com](https://gu-smart-enroll.onrender.com)

## Overview

GU Smart Enroll is a web-based application designed to streamline the course registration process for Gonzaga University students. The application provides an intuitive interface for browsing courses, managing schedules, viewing prerequisites, and exporting schedules to calendar applications.

## Features

### Course Management
- Browse and search courses by subject, course code, instructor, and attributes
- View detailed course information including sections, schedules, and availability
- Filter courses by campus, level, and other criteria

### Schedule Management
- Interactive weekly schedule grid view
- Drag-and-drop course scheduling
- Visual conflict detection
- Multiple semester support

### Prerequisites Visualization
- Visual prerequisite tree/graph for courses
- Multi-level prerequisite exploration
- Clear requirement relationships

### Registration Tools
- Add and remove classes from schedule
- Real-time schedule updates
- Credit hour tracking
- Enrollment status monitoring

### Export Capabilities
- Export schedule as PDF
- Export to Apple Calendar (.ics)
- Export to Google Calendar
- Calendar integration support

### Additional Features
- Campus floor plan viewer
- Final examination schedule viewer
- Reflection tools
- User authentication and profile management
- Responsive design for mobile and desktop

## Technology Stack

### Backend
- **Python 3** - Core programming language
- **Flask** - Web framework
- **Gunicorn** - Production WSGI server
- **Supabase** - Database and authentication
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **HTML5/CSS3** - Structure and styling
- **JavaScript (ES6+)** - Client-side functionality
- **Vanilla JS** - No framework dependencies

### Deployment
- **Render** - Cloud hosting platform
- **Environment Variables** - Secure configuration management

## Project Structure

```
GU-Smart-Enroll/
├── my_app/
│   ├── back-end/
│   │   ├── app.py                 # Main Flask application
│   │   ├── controllers/           # API route handlers
│   │   ├── services/              # Business logic layer
│   │   └── credentials.py        # Environment configuration
│   └── interface/
│       ├── index.html            # Main application page
│       ├── login.html            # Authentication page
│       ├── register.html         # User registration
│       ├── js/                   # JavaScript modules
│       ├── css/                  # Stylesheets
│       └── assets/               # Images and PDFs
├── requirements.txt              # Python dependencies
├── Procfile                      # Render deployment config
└── README.md                     # This file
```

## Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Supabase account and project

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GU-Smart-Enroll
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   PORT=5001
   ```

4. **Run the application**
   ```bash
   cd my_app/back-end
   python app.py
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5001`

### Production Deployment

The application is configured for deployment on Render. See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed deployment instructions.

**Deployed Application:** [https://gu-smart-enroll.onrender.com](https://gu-smart-enroll.onrender.com)

## Environment Variables

The following environment variables are required:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Your Supabase anon/public key | `eyJhbGci...` |
| `PORT` | Server port (optional, defaults to 5001) | `5001` |

## API Endpoints

### Authentication
- `POST /user_bp/login` - User login
- `POST /user_bp/register` - User registration
- `POST /user_bp/logout` - User logout
- `GET /user_bp/user` - Get user profile

### Courses
- `GET /courses_bp/` - Get all courses
- `GET /courses_bp/sections/<course_id>` - Get course sections
- `GET /courses_bp/professors` - Get all professors

### Sections
- `GET /sections_bp/search` - Search sections with filters

### Prerequisites
- `GET /api_bp/graph?course=<code>&all=<boolean>` - Get prerequisite graph

### Export
- `POST /export_bp/apple-calendar` - Export to Apple Calendar
- `POST /export_bp/google-calendar` - Export to Google Calendar
- `POST /export_bp/pdf` - Export to PDF

## Contributing

This is a project for Gonzaga University. For contributions or questions, please contact the development team.

## License

This project is developed for Gonzaga University. All rights reserved.

## Support

For issues or questions:
- Check the [deployment documentation](RENDER_DEPLOYMENT.md)
- Review the application logs in Render dashboard
- Contact the development team

## Acknowledgments

- Gonzaga University for providing the course data and requirements
- Supabase for database and backend services
- Render for hosting infrastructure

---

**Live Application:** [https://gu-smart-enroll.onrender.com](https://gu-smart-enroll.onrender.com)
