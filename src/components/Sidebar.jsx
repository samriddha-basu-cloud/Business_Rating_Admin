import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Star, Users, LogOut, UserCheck } from 'lucide-react'; // Import a suitable icon for "Assign Admin"
import ecociateLogo from '../assets/ecociate_logo.png';
import multiplierLogo from '../assets/multiplier.png';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [showText, setShowText] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
        setShowText(true);
      } else {
        setIsOpen(false);
        setShowText(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => setShowText(true), 150);
    } else {
      setShowText(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-full flex flex-col justify-between ${
        isOpen ? 'w-56 sm:w-64' : 'w-14 sm:w-16'
      } bg-gradient-to-b from-green-400 to-blue-500 transition-all duration-300 ease-in-out shadow-lg md:w-64 z-60`}
    >
      <div>
        <button
          className="m-3 sm:m-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 sm:p-2 transition-colors duration-200 md:hidden"
          onClick={handleToggle}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {isOpen && (
          <div className="flex items-center justify-center space-x-4 mb-4 mt-3">
            <img src={ecociateLogo} alt="Ecociate" className="h-4 sm:h-5 w-auto" />
            <div className="border-r border-blue-800 h-3 sm:h-4 mx-2"></div>
            <img src={multiplierLogo} alt="Multiplier" className="h-6 sm:h-8 w-auto" />
          </div>
        )}
        
        <nav className="flex flex-col items-start mt-6 sm:mt-8">
          <NavLink to="/set-questions" icon={<MessageCircle size={18} />} text="Set Questions" showText={showText} />
          <NavLink to="/review-ratings" icon={<Star size={18} />} text="Review Ratings" showText={showText} />
          <NavLink to="/user-ranking" icon={<Users size={18} />} text="User Ranking" showText={showText} />
          <NavLink to="/assign-admin" icon={<UserCheck size={18} />} text="Assign Admin" showText={showText} /> {/* New tab added */}
        </nav>
      </div>

      <div className="mt-auto mb-6 sm:mb-8 w-full">
        <button 
          onClick={handleLogout} 
          className="w-full text-white p-4 sm:p-4 flex items-center hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
        >
          <span className="mr-3 sm:mr-4"><LogOut size={18} /></span>
          <span className={`font-semibold transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'} md:inline`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon, text, showText }) => (
  <Link 
    to={to} 
    className="w-full text-white p-4 sm:p-4 flex items-center hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
  >
    <span className="mr-3 sm:mr-4">{icon}</span>
    <span className={`font-semibold transition-opacity duration-200 ${showText ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'} md:inline`}>
      {text}
    </span>
  </Link>
);

export default Sidebar;
