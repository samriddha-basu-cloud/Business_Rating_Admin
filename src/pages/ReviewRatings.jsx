import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import UserRatingDetails from './UserRatingDetails';
import { Users, Star, Building, Mail } from 'lucide-react';

const ReviewRatings = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'submissions'));
        const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTimeout(() => {
          setUsers(usersList);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewRatings = (userId) => {
    setSelectedUserId(userId);
  };

  const handleCloseDetails = () => {
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl">
          <p className="text-lg sm:text-xl font-semibold text-gray-800 text-center">Loading Ratings...</p>
          <div className="mt-3 w-8 h-8 sm:w-10 sm:h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-xl mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4 flex items-center justify-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Star className="mr-2 text-blue-500" size={20} />
              Review Ratings
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
              <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2">{user.name}</h3>
              <p className="text-gray-600 flex items-center mb-1 sm:mb-2 text-sm sm:text-base">
                <Mail className="mr-1 sm:mr-2 text-blue-500" size={16} />
                {user.email}
              </p>
              <p className="text-gray-600 flex items-center mb-3 text-sm sm:text-base">
                <Building className="mr-1 sm:mr-2 text-blue-500" size={16} />
                {user.company}
              </p>
              <button 
                className="w-full mt-1 sm:mt-2 p-2 sm:p-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold transition-all duration-300 hover:from-green-500 hover:to-blue-600 flex items-center justify-center text-sm sm:text-base"
                onClick={() => handleViewRatings(user.id)}
              >
                <Star className="mr-1 sm:mr-2" size={16} />
                View Ratings
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedUserId && (
        <UserRatingDetails userId={selectedUserId} onClose={handleCloseDetails} />
      )}
    </div>
  );
};

export default ReviewRatings;