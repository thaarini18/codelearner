import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [auth, setAuth] = useState(null);
  const [checking, setChecking] = useState(true);

  // Restore session on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      setChecking(false);
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Verify the token is still valid
    axios.get('/api/auth/me')
      .then((res) => {
        setAuth({ token, user: res.data.user });
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuth({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setAuth(null);
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        Loading…
      </div>
    );
  }

  if (!auth) {
    return <Login onLogin={handleLogin} />;
  }

  const { user } = auth;
  const courseId = user.courseId || 'course-001';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar userName={user.name} userRole={user.role} onLogout={handleLogout} />
      {user.role === 'teacher'
        ? <TeacherDashboard courseId={courseId} user={user} />
        : <StudentDashboard courseId={courseId} user={user} />}
    </div>
  );
}

export default App;
