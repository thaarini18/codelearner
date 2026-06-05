import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentDashboard = ({ courseId = 'course-001' }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/questions/course/${courseId}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswerReveal = (questionId) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const canViewAnswer = (question) => {
    return question.isAnswerVisible && question.answer;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">
          Loading questions...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        👨‍🎓 Student Dashboard
      </h1>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center text-gray-600 dark:text-gray-400">
            No questions available yet.
          </div>
        ) : (
          questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-700 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {question.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {question.description}
                  </p>

                  {/* Difficulty Badge */}
                  <div className="mt-3">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                      {question.difficulty}
                    </span>
                  </div>

                  {/* Answer Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {canViewAnswer(question) ? (
                      <div className="space-y-3">
                        <button
                          onClick={() => toggleAnswerReveal(question._id)}
                          className="inline-block bg-green-600 dark:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                        >
                          {revealedAnswers[question._id]
                            ? '👁️ Hide Answer'
                            : '👁️ Show Answer'}
                        </button>

                        {revealedAnswers[question._id] && (
                          <div className="mt-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
                              ✓ Teacher's Answer:
                            </p>
                            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                              {question.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          ℹ️ The teacher hasn't released the answer yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 How it Works
        </h3>
        <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
          <li>• Your teacher will provide answers to each question</li>
          <li>• Once they enable visibility, you'll see a "Show Answer" button</li>
          <li>• Click to reveal the official answer provided by your teacher</li>
          <li>• You can hide/show the answer as many times as you want</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentDashboard;
