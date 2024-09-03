import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SetQuestions from './pages/SetQuestions';
import ReviewRatings from './pages/ReviewRatings';
import UserRanking from './pages/UserRanking';

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 ml-16 lg:ml-64 transition-all duration-300">
          <main className="p-4 md:p-8">
            <Routes>
              <Route path="/set-questions" element={<SetQuestions />} />
              <Route path="/review-ratings" element={<ReviewRatings />} />
              <Route path="/user-ranking" element={<UserRanking />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;