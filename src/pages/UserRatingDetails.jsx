import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Users, X, StarsIcon } from 'lucide-react';

const UserRatingDetails = ({ userId, onClose }) => {
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRatings = async () => {
      try {
        // Fetch the user's submission data
        const userSnapshot = await getDocs(collection(db, 'submissions'));
        const userData = userSnapshot.docs.find((doc) => doc.id === userId)?.data();

        if (userData && userData.answers) {
          setUserAnswers(userData.answers);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserRatings();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl">
          <p className="text-lg sm:text-xl font-semibold text-gray-800 text-center">Loading All Ratings...</p>
          <div className="mt-3 w-8 h-8 sm:w-10 sm:h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Function to render stars based on marks
  const renderStars = (marks) => {
    return Array(marks)
      .fill(<StarsIcon size={14} className="mr-1 text-yellow-400" />)
      .map((star, index) => <React.Fragment key={index}>{star}</React.Fragment>);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-6 sm:p-4">
      <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-2xl w-full max-w-2xl sm:max-w-3xl">
        <div className="bg-white rounded-lg p-4 sm:p-6 max-h-[80vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">User Ratings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
              <X size={24} />
            </button>
          </div>
          <ul className="space-y-4 sm:space-y-6">
            {userAnswers.map((answer, index) => (
              <li key={index} className="bg-gray-50 p-3 sm:p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
                <h3
                  className="font-semibold text-base sm:text-lg text-green-800 mb-1 sm:mb-2"
                  dangerouslySetInnerHTML={{ __html: answer.questionHeading }}
                ></h3>
                <div className="flex items-center">
                  <span className="text-xs sm:text-sm font-medium text-blue-500 mr-2 sm:mr-3">Rating:</span>
                  <div className="px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold flex items-center">
                    {renderStars(answer.marks)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserRatingDetails;
