import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Import Firestore database
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDocs, query, collection, where } from 'firebase/firestore'; // Import Firestore query functions
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginimg from '../assets/login.jpg';
import ecociateLogo from '../assets/ecociate_logo.png';
import multiplierLogo from '../assets/multiplier.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons


const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false); // State for confirm password visibility

  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTogglePasswordConfirmationVisibility = () => {
    setShowPasswordConfirmation(!showPasswordConfirmation);
  };

  const handleAdminLogin = () => {
    toast.info('Switching to Rating Panel...', {
      position: 'top-center',
      autoClose: 1000,
      hideProgressBar: false,
    });

    setTimeout(() => {
      window.open('https://bussines-model.vercel.app/', '_blank');
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch user from Firestore based on email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No user found with the given email
        setLoading(false);
        toast.error('Invalid credentials. Only admin can login.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
        });
        return;
      }

      // Check if the user has the admin field set to true
      const userDoc = querySnapshot.docs[0].data(); // Get the first matching document
      if (userDoc.admin !== true) {
        setLoading(false);
        toast.error('Access denied. Only admin can login.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
        });
        return;
      }

      // Sign in the user with email and password
      await signInWithEmailAndPassword(auth, email, password);

      toast.success('Login successful!', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
      });

      setLoading(false);
      navigate('/set-questions');
    } catch (error) {
      setLoading(false);
      toast.error('Login failed. Please try again.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  };

  return (
    <section className="bg-gray-200 min-h-screen flex flex-col justify-center">
      <ToastContainer />
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12 flex-1">
        <section className="relative flex h-32 sm:h-80 lg:h-full items-end bg-gray-900 lg:col-span-5 xl:col-span-6">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center p-6 rounded z-50">
            <img src={ecociateLogo} alt="Ecociate" className="h-4 sm:h-8 w-auto" />
            <div className="border-r border-blue-800 h-3 sm:h-8 mx-2"></div>
            <img src={multiplierLogo} alt="Multiplier" className="h-4 sm:h-12 w-auto" />
          </div>
          <img
            alt=""
            src={loginimg}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="hidden lg:relative lg:block lg:p-12">
            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Welcome to Ecociate!
            </h2>
            <p className="mt-4 leading-relaxed text-white/90">
              "Please log in with your admin credentials to access the Admin Panel."
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl w-full">
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6 bg-gray-200 p-8 rounded-3xl shadow-[inset_-12px_-12px_20px_#ffffff,inset_12px_12px_20px_rgba(70,70,70,0.12)]"
            >
              <div>
                <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-200 shadow-[inset_6px_6px_10px_0_rgba(0,0,0,0.1),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div>

              {/* <div>
                <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-gray-200 shadow-[inset_6px_6px_10px_0_rgba(0,0,0,0.1),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-blue-900"
                  required
                />
              </div> */}

              <div className="relative mb-4">
                <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 rounded-xl bg-gray-200 shadow-[inset_6px_6px_10px_0_rgba(0,0,0,0.1),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-transparent ring-offset-2 ring-offset-green-400"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                    onClick={handleTogglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  className="bg-gradient-to-br from-green-400 to-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-800 focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 text-[#2f7939] mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : 'Admin Login'}
                </button>
                <button
                  type="button"
                  className="text-blue-900 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition duration-200"
                  onClick={handleAdminLogin}
                >
                  User Login
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
};

export default AdminLogin;
