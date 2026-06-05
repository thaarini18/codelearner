# Code Learner LMS - Backend

## Overview
Node.js/Express backend API for the Code Learner LMS with MongoDB.

## Features
- ✅ Question Management (CRUD operations)
- ✅ Answer Submission with Visibility Control
- ✅ RESTful API endpoints
- ✅ Real-time answer visibility toggle

## Project Structure
```
backend/
├── src/
│   ├── models/
│   │   └── Question.js          # Question schema
│   ├── controllers/
│   │   └── questionController.js # Business logic
│   ├── routes/
│   │   └── questionRoutes.js     # API routes
│   └── server.js                 # Express server
├── .env                          # Environment variables
└── package.json
```

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

### Steps

1. **Navigate to backend directory:**
   ```bash
   cd lms-app/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Edit `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/code-learner-lms
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions/course/:courseId` | Get all questions for a course |
| GET | `/api/questions/:id` | Get single question |
| POST | `/api/questions` | Create new question |
| PUT | `/api/questions/:id` | Update question |
| POST | `/api/questions/:id/answer` | Submit/update answer |
| PATCH | `/api/questions/:id/visibility` | Update answer visibility |
| DELETE | `/api/questions/:id` | Delete question |

### Request/Response Examples

**Create Question:**
```json
POST /api/questions
{
  "title": "What is JavaScript?",
  "description": "Explain JavaScript basics",
  "courseId": "course-001",
  "createdBy": "teacher-001",
  "difficulty": "easy"
}
```

**Submit Answer:**
```json
POST /api/questions/{questionId}/answer
{
  "answer": "JavaScript is a programming language..."
}
```

**Toggle Visibility:**
```json
PATCH /api/questions/{questionId}/visibility
{
  "isAnswerVisible": true
}
```

## Database Schema

### Question Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  answer: String (optional),
  isAnswerVisible: Boolean (default: false),
  courseId: String (required),
  createdBy: String (required),
  difficulty: String ('easy', 'medium', 'hard'),
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling
All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Testing
Use tools like Postman or curl to test endpoints:
```bash
# Health check
curl http://localhost:5000/api/health

# Get all questions
curl http://localhost:5000/api/questions/course/course-001
```

## Future Enhancements
- Authentication & Authorization
- User roles (Teacher, Student, Admin)
- Audit logging
- Rate limiting
- Caching with Redis
