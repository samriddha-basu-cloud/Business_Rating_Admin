import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Users, Trophy, Calendar } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const UserRanking = () => {
  const [rankedUsers, setRankedUsers] = useState([]);
  const [maxMarks, setMaxMarks] = useState(0); // Store the maximum achievable marks

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'submissions'));
      let usersList = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Calculate the total marks obtained by summing the marks in answers
        const totalMarksObtained = data.answers.reduce((acc, answer) => acc + (answer.marks || 0), 0);

        // Find the highest mark for a single question
        const highestMark = Math.max(...data.answers.map((answer) => answer.marks || 0));
        const totalQuestions = data.answers.length;

        // Calculate the total achievable marks
        const totalAchievableMarks = totalQuestions * highestMark;

        return {
          id: doc.id,
          totalMarksObtained,
          totalAchievableMarks,
          ...data,
        };
      });

      // Sort users by total marks obtained, highest to lowest
      usersList = usersList.sort((a, b) => b.totalMarksObtained - a.totalMarksObtained);

      // Set the maximum achievable marks
      if (usersList.length > 0) {
        setMaxMarks(usersList[0].totalAchievableMarks);
      }

      setRankedUsers(usersList);
    };

    fetchUsers();
  }, []);

  // Generate chart data for each user
  const generateChartData = (user) => {
    return {
      labels: ['Inclusivity Score', 'Scope of Improvement'],
      datasets: [
        {
          data: [user.totalMarksObtained, user.totalAchievableMarks - user.totalMarksObtained],
          backgroundColor: ['#4CAF50', '#FFC107'],
          hoverBackgroundColor: ['#66BB6A', '#FFCA28'],
        },
      ],
    };
  };

  // Function to download PDF
  const downloadPDF = () => {
    const input = document.getElementById('user-ranking-report');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('UserRankingReport.pdf');
    });
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

        {/* Index for Marks */}
        <div className="mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg shadow-md flex items-center justify-around text-sm sm:text-base text-gray-700">
          <div className="flex items-center">
            <span className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: '#4CAF50' }}></span>
            <span>Inclusivity Score</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: '#FFC107' }}></span>
            <span>Scope of Improvement</span>
          </div>
        </div>

        <div id="user-ranking-report">
          <ol className="space-y-3 sm:space-y-4">
            {rankedUsers.map((user, index) => {
              const chartData = generateChartData(user);
              return (
                <li key={user.id} className="relative bg-white p-4 sm:p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <span className="text-lg sm:text-xl font-bold text-gray-800">{index + 1}</span>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{user.userName}</h3>
                        <p className="text-sm sm:text-base text-gray-500">{user.company}</p>
                        <div className="flex items-center text-gray-500 text-xs sm:text-sm mt-1">
                          <Calendar className="mr-1" size={14} />
                          <span>{new Date(user.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {/* Enhanced Stats for laptop screens */}
                    <div className="hidden lg:flex items-center justify-center flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full px-3 py-1 shadow-md mx-4">
                      <span className="text-sm sm:text-base font-medium text-center">
                        Total Marks: {user.totalMarksObtained} / {user.totalAchievableMarks}
                      </span>
                    </div>
                    <div className="flex items-center justify-center w-24 h-24">
                      <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-0 left-0 mt-3 ml-3 sm:mt-3 sm:mr-3 text-center">
                      <div className="flex items-center p-1 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold text-xs sm:text-xs">
                        First Rated Highest
                        <Trophy className="ml-1 text-white transform scale-75" size={14} />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button
            onClick={downloadPDF}
            className="mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white text-base sm:text-lg font-semibold rounded-3xl shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition duration-200 ease-in-out"
          >
            Download Report as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRanking;
