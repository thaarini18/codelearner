import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('userRole');
    return saved || 'student';
  });
  const navigate = useNavigate();

  const switchRole = (role) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    navigate('/');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar userRole={userRole} />

        {/* Role Switcher */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => switchRole('teacher')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                userRole === 'teacher'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              👨‍🏫 Switch to Teacher
            </button>
            <button
              onClick={() => switchRole('student')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                userRole === 'student'
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              👨‍🎓 Switch to Student
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {userRole === 'teacher' ? (
            <TeacherDashboard courseId="course-001" />
          ) : (
            <StudentDashboard courseId="course-001" />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
