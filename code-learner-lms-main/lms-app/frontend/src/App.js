import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [auth, setAuth] = useState(null);

  const handleLogin = (role, name) => setAuth({ role, name });
  const handleLogout = () => setAuth(null);

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar userName={auth.name} userRole={auth.role} onLogout={handleLogout} />
      {auth.role === 'teacher'
        ? <TeacherDashboard courseId="course-001" />
        : <StudentDashboard courseId="course-001" />}
    </div>
  );
}

export default App;
