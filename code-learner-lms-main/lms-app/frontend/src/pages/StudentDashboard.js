import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DIFF_COLORS = {
  easy: { bg: '#d4edda', color: '#155724' },
  medium: { bg: '#fff3cd', color: '#856404' },
  hard: { bg: '#f8d7da', color: '#721c24' },
};

const Sidebar = ({ active, setActive }) => {
  const items = [
    { id: 'questions', label: 'Course questions', icon: '📋' },
    { id: 'resources', label: 'Resources', icon: '📁' },
    { id: 'grades', label: 'My grades', icon: '📊' },
  ];
  return (
    <div style={{ width: 220, background: 'white', borderRight: '1px solid #dee2e6', minHeight: 'calc(100vh - 52px)', flexShrink: 0 }}>
      <div style={{ padding: '16px 16px 8px', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 }}>Navigation</div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px',
            background: active === item.id ? '#e8f0fb' : 'transparent',
            borderLeft: active === item.id ? '4px solid #0f6cbf' : '4px solid transparent',
            border: 'none', cursor: 'pointer',
            fontSize: 14, color: active === item.id ? '#0f6cbf' : '#333',
            fontWeight: active === item.id ? 500 : 400, textAlign: 'left',
          }}
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}
      <div style={{ margin: '12px 12px', borderTop: '1px solid #dee2e6' }} />
      <div style={{ padding: '6px 16px 6px', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 }}>Course</div>
      <div style={{ padding: '8px 16px', fontSize: 13, color: '#555' }}>
        <div style={{ fontWeight: 500, marginBottom: 2 }}>CS101</div>
        <div style={{ color: '#888', fontSize: 12 }}>Introduction to MIPS Assembly</div>
      </div>
    </div>
  );
};

const StudentDashboard = ({ courseId = 'course-001' }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [activeSection, setActiveSection] = useState('questions');

  useEffect(() => { fetchQuestions(); }, [courseId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/questions/course/${courseId}`);
      setQuestions(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleReveal = (id) => setRevealed(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)', background: '#f2f2f2' }}>
      <Sidebar active={activeSection} setActive={setActiveSection} />

      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          <span style={{ color: '#0f6cbf', cursor: 'pointer' }}>Dashboard</span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: '#0f6cbf', cursor: 'pointer' }}>CS101</span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span>Course questions</span>
        </div>

        {activeSection === 'questions' && (
          <>
            <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 600, color: '#333' }}>Course questions</h1>

            {/* Course info banner */}
            <div style={{ background: 'white', borderRadius: 6, border: '1px solid #dee2e6', marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ background: '#0f6cbf', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>💻</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>CS101 – Introduction to MIPS Assembly</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Review the questions below. Your teacher controls answer visibility.</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>Loading questions...</div>
            ) : questions.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 6, border: '1px solid #dee2e6', padding: 40, textAlign: 'center', color: '#666' }}>
                No questions have been posted yet.
              </div>
            ) : (
              questions.map((q, i) => (
                <div key={q._id} style={{ background: 'white', borderRadius: 6, border: '1px solid #dee2e6', marginBottom: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f6cbf', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#333', marginBottom: 4 }}>{q.title}</div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{q.description}</div>
                      <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 12, fontWeight: 500, background: DIFF_COLORS[q.difficulty]?.bg || '#eee', color: DIFF_COLORS[q.difficulty]?.color || '#333' }}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '14px 20px', background: '#fafafa' }}>
                    {q.isAnswerVisible && q.answer ? (
                      <div>
                        <button
                          onClick={() => toggleReveal(q._id)}
                          style={{ padding: '7px 16px', background: revealed[q._id] ? '#e8f0fb' : '#0f6cbf', color: revealed[q._id] ? '#0f6cbf' : 'white', border: revealed[q._id] ? '1px solid #0f6cbf' : 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
                        >
                          {revealed[q._id] ? '▲ Hide answer' : '▼ Show answer'}
                        </button>
                        {revealed[q._id] && (
                          <div style={{ marginTop: 12, background: '#f0fff4', border: '1px solid #c3e6cb', borderRadius: 4, padding: '12px 16px' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#155724', marginBottom: 6 }}>✓ Teacher's answer</div>
                            <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#333', whiteSpace: 'pre-wrap' }}>{q.answer}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#888', fontSize: 13 }}>
                        <span>🔒</span>
                        <span>The teacher hasn't released the answer yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {(activeSection === 'resources' || activeSection === 'grades') && (
          <div style={{ background: 'white', borderRadius: 6, border: '1px solid #dee2e6', padding: 40, textAlign: 'center', color: '#888' }}>
            This section is not yet available.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
