import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = ({ courseId = 'course-001' }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    fetchQuestions();
  }, [courseId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/questions/course/${courseId}`);
      setQuestions(response.data);
      // Initialize answers state
      const answersObj = {};
      response.data.forEach((q) => {
        answersObj[q._id] = q.answer || '';
      });
      setAnswers(answersObj);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.title.trim() || !newQuestion.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('/api/questions', {
        ...newQuestion,
        courseId,
        createdBy: 'teacher-001',
      });
      setQuestions([response.data, ...questions]);
      setAnswers({ ...answers, [response.data._id]: '' });
      setNewQuestion({ title: '', description: '', difficulty: 'medium' });
      alert('Question created successfully!');
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question');
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!answers[questionId].trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      const response = await axios.post(`/api/questions/${questionId}/answer`, {
        answer: answers[questionId],
      });
      setQuestions(
        questions.map((q) => (q._id === questionId ? response.data : q))
      );
      setEditingAnswerId(null);
      alert('Answer saved successfully!');
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Failed to save answer');
    }
  };

  const handleToggleVisibility = async (questionId, currentVisibility) => {
    try {
      const response = await axios.patch(
        `/api/questions/${questionId}/visibility`,
        {
          isAnswerVisible: !currentVisibility,
        }
      );
      setQuestions(
        questions.map((q) => (q._id === questionId ? response.data : q))
      );
      alert('Visibility updated!');
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert('Failed to update visibility');
    }
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
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        👨‍🏫 Teacher Dashboard
      </h1>

      {/* Create New Question Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Create New Question
        </h2>
        <form onSubmit={handleCreateQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Title
            </label>
            <input
              type="text"
              value={newQuestion.title}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
              placeholder="Enter question title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Description
            </label>
            <textarea
              value={newQuestion.description}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
              placeholder="Enter question description"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level
            </label>
            <select
              value={newQuestion.difficulty}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, difficulty: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200"
          >
            Create Question
          </button>
        </form>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center text-gray-600 dark:text-gray-400">
            No questions yet. Create one to get started!
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {question.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {question.description}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                      {question.difficulty}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full">
                      ID: {question._id.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Answer Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="space-y-4">
                  {editingAnswerId === question._id ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Edit Answer
                      </label>
                      <textarea
                        value={answers[question._id]}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [question._id]: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 outline-none"
                        rows="4"
                        placeholder="Enter the correct answer"
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            handleSubmitAnswer(question._id)
                          }
                          className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-800 transition-colors duration-200"
                        >
                          Save Answer
                        </button>
                        <button
                          onClick={() => setEditingAnswerId(null)}
                          className="bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {question.answer ? (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Answer:
                          </p>
                          <div className="mt-2 bg-gray-100 dark:bg-gray-700 p-4 rounded text-gray-900 dark:text-gray-100">
                            {question.answer}
                          </div>
                          <button
                            onClick={() => setEditingAnswerId(question._id)}
                            className="mt-3 bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors duration-200"
                          >
                            ✏️ Edit Answer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingAnswerId(question._id)}
                          className="w-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          + Add Answer
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Visibility Toggle */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Allow students to view answer
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {question.isAnswerVisible
                          ? 'Answer is visible to students'
                          : 'Answer is hidden from students'}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleToggleVisibility(
                          question._id,
                          question.isAnswerVisible
                        )
                      }
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        question.isAnswerVisible
                          ? 'bg-green-600 dark:bg-green-700'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          question.isAnswerVisible ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
