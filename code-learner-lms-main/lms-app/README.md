# Code Learner LMS - Complete Setup Guide

## Quick Start Overview

This is a full-stack Learning Management System with two major features:

1. **Answer Visibility Control** - Teachers manage answers and control who sees them
2. **Global Light/Dark Mode** - System-wide theme toggle with persistence

## Project Structure

```
lms-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── routes/
│   ├── .env
│   ├── package.json
│   └── README.md
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── package.json
    ├── tailwind.config.js
    └── README.md
```

## Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

**Configure MongoDB** in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/code-learner-lms
PORT=5000
NODE_ENV=development
```

**Start Backend Server:**
```bash
npm start
# or with auto-reload
npm run dev
```

Server runs on: `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

App opens at: `http://localhost:3000`

## Features Overview

### Feature 1: Answer Visibility Control

#### Teacher Dashboard
1. **Create Questions**: Add title, description, difficulty
2. **Submit Answers**: Click "Add Answer" then save
3. **Edit Answers**: Use "Edit" button to modify
4. **Control Visibility**: Toggle switch to allow/deny student access

#### Student Dashboard
1. **View Questions**: See all course questions
2. **Check Visibility**: Only see "Show Answer" if teacher enabled it
3. **Reveal Answers**: Click button to reveal or hide answer

### Feature 2: Light/Dark Mode

- **Toggle Button**: Located in navbar (top-right)
- **Persistence**: Theme preference saved in localStorage
- **System-wide**: All components automatically styled
- **Smooth Transitions**: 200ms color transitions
- **Tailwind Support**: Uses Tailwind's dark mode classes

## How to Use

### As a Teacher

1. Open app and click **"Switch to Teacher"**
2. Create a new question
3. Enter answer text
4. Click **"Save Answer"**
5. Toggle the visibility switch to allow students to view
6. Students can now see the "Show Answer" button

### As a Student

1. Open app and click **"Switch to Student"**
2. View all available questions
3. If teacher enabled visibility, click **"Show Answer"**
4. Read the teacher's answer
5. Click **"Hide Answer"** to hide it again

### Theme Switching

1. Click the **sun/moon icon** in top-right navbar
2. Page switches to dark mode (or light mode)
3. Preference is automatically saved
4. Next visit will remember your choice

## API Endpoints Reference

### Questions
- `GET /api/questions/course/:courseId` - List all questions
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `POST /api/questions/:id/answer` - Submit answer
- `PATCH /api/questions/:id/visibility` - Toggle visibility
- `DELETE /api/questions/:id` - Delete question

## Database Schema

### Question
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  answer: String (or null),
  isAnswerVisible: Boolean (default: false),
  courseId: String,
  createdBy: String,
  difficulty: String ('easy' | 'medium' | 'hard'),
  createdAt: Date,
  updatedAt: Date
}
```

## Key Technologies

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- CORS middleware

**Frontend:**
- React 18
- React Router 6
- Tailwind CSS
- Axios (HTTP client)
- Context API (state management)

## Code Organization

### Backend - Models
[Question.js](backend/src/models/Question.js) - Defines Question schema with `answer` and `isAnswerVisible` fields

### Backend - Controllers
[questionController.js](backend/src/controllers/questionController.js) - Handles:
- `submitAnswer()` - Save teacher's answer
- `updateAnswerVisibility()` - Toggle visibility
- `getQuestions()` - Retrieve questions

### Frontend - Context
[ThemeContext.js](frontend/src/contexts/ThemeContext.js) - Global theme state with localStorage persistence

### Frontend - Components
- [Navbar.js](frontend/src/components/Navbar.js) - Navigation and theme toggle
- [ThemeToggle.js](frontend/src/components/ThemeToggle.js) - Dark mode button

### Frontend - Pages
- [TeacherDashboard.js](frontend/src/pages/TeacherDashboard.js) - Teacher interface
- [StudentDashboard.js](frontend/src/pages/StudentDashboard.js) - Student interface

## Styling Details

### Dark Mode Implementation

The app uses Tailwind CSS's class-based dark mode:

```css
/* tailwind.config.js */
darkMode: 'class'
```

All components follow this pattern:
```jsx
<div className="bg-white dark:bg-gray-800">
  Light: white background
  Dark: gray-800 background
</div>
```

### Color Scheme

**Light Mode:**
- Background: White/Light Gray
- Text: Dark Gray/Black
- Accents: Blue primary

**Dark Mode:**
- Background: Dark Gray/Black
- Text: White/Light Gray
- Accents: Blue (slightly adjusted)

## Deployment Considerations

### Backend Deployment
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Deploy on Heroku, AWS, DigitalOcean, etc.

### Frontend Deployment
- Build: `npm run build`
- Update API proxy to production backend
- Deploy on Vercel, Netlify, AWS S3, etc.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` in respective folder |
| Backend not responding | Check port 5000, ensure MongoDB is running |
| Theme not persisting | Check localStorage is enabled |
| Styles look broken | Restart frontend server, clear browser cache |
| Questions not loading | Check browser console for API errors |

## Next Steps

1. ✅ Verify both servers are running
2. ✅ Create a test question as teacher
3. ✅ Submit an answer
4. ✅ Toggle visibility
5. ✅ Switch to student and view answer
6. ✅ Test dark mode toggle

## Support & Documentation

- Backend docs: [backend/README.md](backend/README.md)
- Frontend docs: [frontend/README.md](frontend/README.md)
- Check console for detailed error messages

---

**Happy Learning! 📚**
