# Mergington High School Activities API

A simple FastAPI application for viewing and managing extracurricular activity registrations.

## Features

- View all available extracurricular activities
- Teachers can register and unregister students after logging in
- Students can view activities and participant lists without logging in

## Teacher Accounts

Teacher accounts are configured in `src/teachers.json`. Add assigned credentials
to its `teachers` list, for example:

```json
{
  "teachers": [
    { "username": "teacher1", "password": "assigned-password" }
  ]
}
```

The file is checked in as an empty template. Do not use example credentials in
production; restrict access to the repository and serve the application over
HTTPS because passwords are stored in this file.

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities and current participants (public)                 |
| GET    | `/auth/status`                                                    | Check whether the current browser is logged in as a teacher          |
| POST   | `/auth/login`                                                     | Log in with a JSON `username` and `password`                          |
| POST   | `/auth/logout`                                                    | Log out the current browser                                          |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Register a student (teacher login required)                          |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Unregister a student (teacher login required)                     |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.
