import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Trophy, Calendar } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

  const generateChartData = (ratings) => {
    const counts = getRatingCounts(ratings);
    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [
        {
          data: [counts.High, counts.Medium, counts.Low],
          backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
          hoverBackgroundColor: ['#66BB6A', '#FFCA28', '#42A5F5'],
        },
      ],
    };
  };

  return (
    <div className="p-2 sm:p-2 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl sm:max-w-4xl md:max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-xl mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center">
              <Users className="mr-2 sm:mr-3 text-blue-500" size={24} />
              User Ranking
            </h2>
          </div>
        </div>
        {/* Index for Rating Colors */}
        <div className="mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg shadow-md flex items-center justify-around text-sm sm:text-base text-gray-700">
          <div className="flex items-center">
            <span className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>High</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: '#FFC107' }}></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: '#2196F3' }}></span>
            <span>Low</span>
          </div>
        </div>
        <ol className="space-y-3 sm:space-y-4">
          {rankedUsers.map((user, index) => {
            const chartData = generateChartData(user.ratings);
            const ratingCounts = getRatingCounts(user.ratings);
            return (
              <li key={user.id} className="relative bg-white p-3 sm:p-4 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg sm:text-xl font-bold text-gray-800">{index + 1}</span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{user.name}</h3>
                      <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                        <Calendar className="mr-1" size={14} />
                        <span>{user.timestamp.toDate().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {/* Enhanced Stats for laptop screens */}
                  <div className="hidden lg:flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full px-3 py-1 shadow-md mx-4">
                    <span className="text-sm sm:text-base font-medium">
                      High: {ratingCounts.High} | Medium: {ratingCounts.Medium} | Low: {ratingCounts.Low}
                    </span>
                  </div>
                  <div className="w-24 h-24">
                    <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </div>
                {index === 0 && (
                  <div className="absolute top-0 left-0 mt-3 ml-3 sm:mt-3 sm:mr-3 text-center">
                    <div className="flex items-center p-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold text-xs sm:text-sm">
                      Rated Highest
                      <Trophy className="ml-1 text-white transform scale-75" size={14} />
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
