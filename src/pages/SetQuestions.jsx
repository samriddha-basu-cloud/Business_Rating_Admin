import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PencilIcon, TrashIcon, PlusIcon, MessageCircleQuestionIcon } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const SetQuestions = () => {
  // State for the new fields
  const [heading, setHeading] = useState('');
  const [narration, setNarration] = useState('');
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([{ text: '', marks: 0 }]); // State for options
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editableQuestionId, setEditableQuestionId] = useState(null);

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
        await updateDoc(questionRef, { heading, narration, question, options });
        toast.success('Question updated successfully!', { autoClose: 2000 });
        setIsEditing(false);
        setCurrentQuestionId(null);
        fetchQuestions();
      } catch (error) {
        console.error('Error updating question:', error);
      }
    } else {
      try {
        await addDoc(collection(db, 'questions'), {
          heading,
          narration,
          question,
          options,
          ques_id: Date.now(),
        });
        setHeading('');
        setNarration('');
        setQuestion('');
        setOptions([{ text: '', marks: 0 }]); // Reset options
        toast.success('Question added successfully!', { autoClose: 2000 });
        fetchQuestions();
      } catch (error) {
        console.error('Error adding question:', error);
      }
    }
  };

  const handleEdit = (question) => {
    setEditableQuestionId(question.id);
    setHeading(question.heading);
    setNarration(question.narration);
    setQuestion(question.question);
    setOptions(question.options || [{ text: '', marks: 0 }]); // Load existing options or default
    setIsEditing(true);
    setCurrentQuestionId(question.id);
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
      toast.success('Question deleted successfully!', { autoClose: 2000 });
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index][field] = value;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', marks: 0 }]);
  };

  const removeOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
  };

  const handleInlineEditChange = (id, field, value) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  const handleInlineEditSave = async (id) => {
    const questionToUpdate = questions.find((q) => q.id === id);
    if (questionToUpdate) {
      try {
        const questionRef = doc(db, 'questions', id);
        await updateDoc(questionRef, {
          heading: questionToUpdate.heading,
          narration: questionToUpdate.narration,
          question: questionToUpdate.question,
          options: questionToUpdate.options,
        });
        toast.success('Question updated successfully!', { autoClose: 2000 });
        setEditableQuestionId(null);
        fetchQuestions();
      } catch (error) {
        console.error('Error updating question:', error);
      }
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
      <ToastContainer />
      <div className="max-w-7xl sm:max-w-4xl md:max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-xl mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center">
              <MessageCircleQuestionIcon className="mr-2 sm:mr-3 text-blue-500" size={24} />
              Manage Questions
            </h2>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 space-y-3">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Heading</h4>
          <ReactQuill
            value={heading}
            onChange={setHeading}
            className="bg-white rounded-lg shadow-md mb-2"
            placeholder="Enter the heading"
            theme="snow"
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link'],
                ['clean'],
              ],
            }}
          />
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Narative</h4>
          <ReactQuill
            value={narration}
            onChange={setNarration}
            className="bg-white rounded-lg shadow-md mb-2"
            placeholder="Enter the narration"
            theme="snow"
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link'],
                ['clean'],
              ],
            }}
          />
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Question</h4>
          <ReactQuill
            value={question}
            onChange={setQuestion}
            className="bg-white rounded-lg shadow-md mb-2"
            placeholder="Enter the question"
            theme="snow"
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link'],
                ['clean'],
              ],
            }}
          />
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Options</h4>
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  className="p-2 border rounded mr-2 flex-grow"
                  placeholder={`Option ${index + 1}`}
                />
                <input
                  type="number"
                  value={option.marks}
                  onChange={(e) => handleOptionChange(index, 'marks', parseInt(e.target.value, 10))}
                  className="p-2 border rounded w-20 mr-2"
                  placeholder="Marks"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={addOption}
                className="w-1/5 p-2 sm:p-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:from-green-500 hover:to-blue-600 text-sm sm:text-base"
              >
                <PlusIcon size={16} className="mr-2" />
                Add Option
              </button>
            </div>
          </div>
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
                  {editableQuestionId === question.id ? (
                    <div>
                      <ReactQuill
                        value={question.heading}
                        onChange={(value) => handleInlineEditChange(question.id, 'heading', value)}
                        className="p-2 border rounded w-full mb-2"
                        modules={{
                          toolbar: [
                            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['link'],
                            ['clean'],
                          ],
                        }}
                      />
                      <ReactQuill
                        value={question.narration}
                        onChange={(value) => handleInlineEditChange(question.id, 'narration', value)}
                        className="p-2 border rounded w-full mb-2"
                        modules={{
                          toolbar: [
                            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['link'],
                            ['clean'],
                          ],
                        }}
                      />
                      <ReactQuill
                        value={question.question}
                        onChange={(value) => handleInlineEditChange(question.id, 'question', value)}
                        className="p-2 border rounded w-full mb-2"
                        modules={{
                          toolbar: [
                            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'align': [] }],
                            ['link'],
                            ['clean'],
                          ],
                        }}
                      />
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleInlineEditChange(question.id, `options[${index}].text`, e.target.value)}
                            className="p-2 border rounded mr-2 flex-grow"
                          />
                          <input
                            type="number"
                            value={option.marks}
                            onChange={(e) => handleInlineEditChange(question.id, `options[${index}].marks`, parseInt(e.target.value, 10))}
                            className="p-2 border rounded w-20 mr-2"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleInlineEditSave(question.id)}
                        className="p-1 sm:p-2 text-green-500 hover:bg-green-100 rounded-full transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* <h4 className="font-semibold text-base sm:text-lg text-gray-800 mb-1 sm:mb-2">{ {__html: question.heading}}</h4> */}
                     <div className="font-bold mb-1">Heading</div>
                    <div
                      className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: question.heading }}
                    ></div>
                    <div className="font-bold mb-1">Naration</div>
                      <div
                        className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: question.narration }}
                      ></div>
                      <div className="font-bold mb-1">Question</div>
                      <div
                        className="text-gray-600 mb-2 sm:mb-3 text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      ></div>
                      <div className="font-bold mb-1">Options</div>
                      <ul className="list-disc pl-5">
                        {question.options.map((option, index) => (
                          <li key={index} className="text-sm sm:text-base text-gray-700 mb-1">
                            {option.text} - {option.marks} marks
                          </li>
                        ))}
                      </ul>
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
                    </div>
                  )}
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
