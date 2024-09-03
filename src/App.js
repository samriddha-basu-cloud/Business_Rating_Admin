import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SetQuestions from './pages/SetQuestions';
import ReviewRatings from './pages/ReviewRatings';
import UserRanking from './pages/UserRanking';
import AdminLogin from './pages/AdminLogin';
import AssignAdmin from './pages/AssignAdmin'; // Import the new AssignAdmin component

const AppContent = () => {
  const location = useLocation(); // Moved inside the Router context

  return (
    <>
      {/* Conditionally render the Sidebar only if the current path is not "/" */}
      {location.pathname !== '/' && <Sidebar />}
      <div className="flex min-h-screen bg-gray-100">
        <div className={`flex-1 ${location.pathname !== '/' ? 'ml-16 lg:ml-64' : ''} transition-all duration-300`}>
          <main className="p-4 md:p-8">
            <Routes>
              <Route path="/set-questions" element={<SetQuestions />} />
              <Route path="/review-ratings" element={<ReviewRatings />} />
              <Route path="/user-ranking" element={<UserRanking />} />
              <Route path="/assign-admin" element={<AssignAdmin />} /> {/* Add route for Assign Admin */}
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/*" element={<AppContent />} /> {/* Render other routes inside AppContent */}
      </Routes>
    </Router>
  );
};

export default App;
