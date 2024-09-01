import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Trophy, Star, Calendar } from 'lucide-react';

const UserRanking = () => {
  const [rankedUsers, setRankedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'submissions'));
      let usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      usersList = usersList.sort((a, b) => {
        const highRatingsA = Object.values(a.ratings).filter((r) => r === 'High').length;
        const highRatingsB = Object.values(b.ratings).filter((r) => r === 'High').length;

        if (highRatingsA !== highRatingsB) {
          return highRatingsB - highRatingsA;
        } else {
          return a.timestamp.toDate() - b.timestamp.toDate();
        }
      });

      setRankedUsers(usersList);
    };

    fetchUsers();
  }, []);

  const getRatingCounts = (ratings) => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    Object.values(ratings).forEach((rating) => {
      counts[rating]++;
    });
    return counts;
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-xl mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center">
              <Users className="mr-2 sm:mr-3 text-blue-500" size={24} />
              User Ranking
            </h2>
          </div>
        </div>
        <ol className="space-y-3 sm:space-y-4">
          {rankedUsers.map((user, index) => {
            const ratingCounts = getRatingCounts(user.ratings);
            return (
              <li key={user.id} className="relative bg-white p-3 sm:p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <span className="text-lg sm:text-xl font-bold text-gray-800 mr-3">{index + 1}</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{user.name}</h3>
                      <div className="flex flex-wrap items-center mt-1 sm:mt-2 space-x-2 sm:space-x-4">
                        <div className="flex items-center">
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <span className="text-xs sm:text-sm text-gray-600">High: {ratingCounts.High}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <span className="text-xs sm:text-sm text-gray-600">Medium: {ratingCounts.Medium}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="text-yellow-400 mr-1" size={14} />
                          <span className="text-xs sm:text-sm text-gray-600">Low: {ratingCounts.Low}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    {index !== 0 && (
                      <>
                        <Calendar className="mr-1" size={14} />
                        <span>{user.timestamp.toDate().toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                {index === 0 && (
                  <div className="absolute top-0 right-0 mt-3 mr-2 sm:mt-3 sm:mr-3 text-center">
                    <div className="flex items-center p-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold text-xs sm:text-sm">
                      Rated Highest
                      <Trophy className="ml-1 text-white transform scale-75" size={14} />
                    </div>
                    <div className="flex items-center justify-center mt-6 sm:mt-2 text-gray-500 text-xs sm:text-sm">
                      <Calendar className="mr-1" size={14} />
                      <span>{user.timestamp.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default UserRanking;