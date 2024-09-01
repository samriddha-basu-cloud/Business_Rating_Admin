import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PencilIcon, TrashIcon, PlusIcon, MessageCircleQuestionIcon } from 'lucide-react';

const SetQuestions = () => {
  const [parameter, setParameter] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTimeout(() => {
        setQuestions(questionsList);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      try {
        const questionRef = doc(db, 'questions', currentQuestionId);
        await updateDoc(questionRef, { parameter, description });
        alert('Question updated successfully!');
        setIsEditing(false);
        setCurrentQuestionId(null);
        fetchQuestions();
      } catch (error) {
        console.error('Error updating question:', error);
      }
    } else {
      try {
        await addDoc(collection(db, 'questions'), {
          parameter,
          description,
          ques_id: Date.now(),
        });
        setParameter('');
        setDescription('');
        alert('Question added successfully!');
        fetchQuestions();
      } catch (error) {
        console.error('Error adding question:', error);
      }
    }
  };

  const handleEdit = (question) => {
    setParameter(question.parameter);
    setDescription(question.description);
    setIsEditing(true);
    setCurrentQuestionId(question.id);
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      alert('Question deleted successfully!');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl">
          <p className="text-lg sm:text-xl font-semibold text-gray-800 text-center">Loading Questions...</p>
          <div className="mt-3 w-8 h-8 sm:w-10 sm:h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-xl mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 flex items-center justify-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center">
              <MessageCircleQuestionIcon className="mr-2 text-blue-500" size={20} />
              Manage Questions
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 space-y-3">
          <input
            type="text"
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            className="p-2 sm:p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter the question's parameter"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 sm:p-3 border rounded-lg w-full h-20 sm:h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter the question's description"
            required
          />
          <button
            type="submit"
            className="w-full p-2 sm:p-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:from-green-500 hover:to-blue-600 text-sm sm:text-base"
          >
            {isEditing ? <PencilIcon size={16} className="mr-2" /> : <PlusIcon size={16} className="mr-2" />}
            {isEditing ? 'Update Question' : 'Add Question'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Questions List</h3>
          {questions.length > 0 ? (
            <ul className="space-y-4">
              {questions.map((question) => (
                <li
                  key={question.id}
                  className="bg-white p-3 sm:p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  <h4 className="font-semibold text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">{question.parameter}</h4>
                  <p className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base">{question.description}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-1 sm:p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-1 sm:p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 text-sm sm:text-base">No questions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetQuestions;