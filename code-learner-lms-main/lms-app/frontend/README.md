# Code Learner LMS - Frontend

## Overview
React frontend for the Code Learner LMS with Teacher and Student dashboards.

## Features
- ✅ Teacher Dashboard: Create questions, submit answers, control visibility
- ✅ Student Dashboard: View questions, reveal answers when permitted
- ✅ Global Light/Dark Mode Toggle with localStorage persistence
- ✅ Responsive Design with Tailwind CSS
- ✅ Smooth transitions and animations

## Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js            # Navigation bar
│   │   └── ThemeToggle.js        # Dark mode toggle
│   ├── contexts/
│   │   └── ThemeContext.js       # Theme state management
│   ├── pages/
│   │   ├── TeacherDashboard.js   # Teacher view
│   │   └── StudentDashboard.js   # Student view
│   ├── App.js                    # Main app component
│   ├── App.css                   # Tailwind imports
│   ├── index.js                  # React entry point
│   └── index.html
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── package.json
```

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Steps

1. **Navigate to frontend directory:**
   ```bash
   cd lms-app/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Configuration

The frontend expects the backend API at:
- Local development: `http://localhost:5000`

This is configured in `package.json`:
```json
"proxy": "http://localhost:5000"
```

## Theme System

### How Light/Dark Mode Works

1. **Theme Context** (`ThemeContext.js`)
   - Global state for theme using React Context API
   - Automatically persists to localStorage
   - Updates document class for CSS support

2. **Theme Toggle Button** (`ThemeToggle.js`)
   - Available in Navbar
   - Click to switch between light and dark modes
   - Shows sun/moon icon based on current theme

3. **Tailwind Configuration** (`tailwind.config.js`)
   - Uses `class` strategy for dark mode
   - All components use `dark:` prefix for dark mode styles

### Usage in Components

```javascript
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

function MyComponent() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={toggleTheme}>
      Current mode: {isDarkMode ? 'Dark' : 'Light'}
    </button>
  );
}
```

### Example Styling

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  This div is white in light mode, dark gray in dark mode
</div>
```

## Component Overview

### Teacher Dashboard (`TeacherDashboard.js`)

**Features:**
- Create new questions
- Set difficulty level
- Submit/edit answers
- Toggle answer visibility with one-click toggle switch
- View all questions in a course

**UI Elements:**
- Question creation form
- Answer input area
- Visibility toggle switch
- Edit/Save buttons

### Student Dashboard (`StudentDashboard.js`)

**Features:**
- View all questions in a course
- See difficulty levels
- Click "Show Answer" button to reveal teacher's answer
- Only visible if teacher has set `isAnswerVisible: true`
- Hide/show answers multiple times

**UI Elements:**
- Question cards with difficulty badges
- Conditional "Show Answer" button
- Answer reveal animation
- Info section explaining how it works

### Navbar (`Navbar.js`)

**Features:**
- Branding
- Navigation links
- Current user role display
- Theme toggle button

### Theme Toggle (`ThemeToggle.js`)

**Features:**
- Moon/sun icons
- Smooth transitions
- Keyboard accessible
- Visual feedback

## Answer Visibility Control Logic

```javascript
// Check if answer should be visible to students
const canViewAnswer = (question) => {
  return question.isAnswerVisible && question.answer;
};
```

Only show the "Show Answer" button if:
1. `isAnswerVisible` is `true` (teacher enabled it)
2. `answer` field is not empty (teacher submitted an answer)

## Role Switching

Students can switch between Teacher and Student roles using buttons at the top of the page:
- **Teacher Mode**: Full CRUD on questions and answers
- **Student Mode**: Read-only access with conditional answer visibility

Role is persisted in localStorage.

## Styling & Responsive Design

- **Framework**: Tailwind CSS
- **Breakpoints**: Mobile-first responsive design
- **Colors**: Blue primary, Gray for UI, Green for success states
- **Dark Mode**: All components have dark mode variants
- **Transitions**: Smooth 200ms transitions on color/bg changes

## API Integration

The frontend communicates with backend via REST API:

```javascript
// Example: Fetch questions
const response = await axios.get(`/api/questions/course/${courseId}`);

// Example: Submit answer
await axios.post(`/api/questions/${questionId}/answer`, {
  answer: 'Your answer here'
});

// Example: Toggle visibility
await axios.patch(`/api/questions/${questionId}/visibility`, {
  isAnswerVisible: true
});
```

## Troubleshooting

### Backend not connecting
- Ensure backend is running on port 5000
- Check CORS is enabled in backend
- Verify MongoDB connection

### Dark mode not persisting
- Check browser's localStorage is enabled
- Clear browser cache and try again

### Styles not loading
- Run `npm install` to ensure Tailwind is installed
- Check `tailwind.config.js` is properly configured

## Future Enhancements
- User authentication
- Multiple courses
- Student submitted answers
- Grading system
- Real-time collaboration
- Export reports
