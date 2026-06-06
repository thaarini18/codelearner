import React, { useState } from 'react';

const CREDENTIALS = {
  teacher: { username: 'teacher', password: 'teacher123', name: 'Prof. Smith' },
  student: { username: 'student', password: 'student123', name: 'Alex Johnson' },
};

const Login = ({ onLogin }) => {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const creds = CREDENTIALS[role];
    if (username === creds.username && password === creds.password) {
      onLogin(role, creds.name);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f2f2f2', display: 'flex', flexDirection: 'column' }}>
      {/* Moodle-style header */}
      <div style={{ background: '#0f6cbf', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="8" fill="white" fillOpacity="0.15"/>
          <text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="bold" fill="white">M</text>
        </svg>
        <span style={{ color: 'white', fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>Code Learner LMS</span>
      </div>

      {/* Login card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', width: '100%', maxWidth: 420, overflow: 'hidden' }}>
          {/* Role tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6' }}>
            {['student', 'teacher'].map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); setUsername(''); setPassword(''); }}
                style={{
                  flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  background: role === r ? 'white' : '#f8f9fa',
                  color: role === r ? '#0f6cbf' : '#666',
                  borderBottom: role === r ? '3px solid #0f6cbf' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {r === 'student' ? '🎓 Student' : '🏫 Teacher'}
              </button>
            ))}
          </div>

          <div style={{ padding: '32px 32px 28px' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 600, color: '#333' }}>
              {role === 'student' ? 'Student login' : 'Teacher login'}
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#666' }}>
              {role === 'student'
                ? 'Sign in to view your course questions and answers.'
                : 'Sign in to manage questions and control answer visibility.'}
            </p>

            {error && (
              <div style={{ background: '#fdf2f2', border: '1px solid #f5c6cb', borderRadius: 4, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#842029' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 6 }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'student' ? 'student' : 'teacher'}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: 4, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 6 }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #ced4da', borderRadius: 4, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                  required
                />
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '10px', background: '#0f6cbf', color: 'white', border: 'none', borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                Log in
              </button>
            </form>

            <div style={{ marginTop: 20, padding: '12px 14px', background: '#f0f7ff', borderRadius: 4, fontSize: 12, color: '#555' }}>
              <strong>Demo credentials</strong><br />
              {role === 'student' ? 'Username: student · Password: student123' : 'Username: teacher · Password: teacher123'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: '#888' }}>
        Code Learner LMS · Powered by Moodle
      </div>
    </div>
  );
};

export default Login;
