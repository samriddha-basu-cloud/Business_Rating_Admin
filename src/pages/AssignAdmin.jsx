import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { UserCheck, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AssignAdmin = () => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current logged-in user's information
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    fetchAdmins(); // Fetch all current admins when the component mounts

    return () => unsubscribe();
  }, []);

  const fetchAdmins = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('admin', '==', true));
      const querySnapshot = await getDocs(q);
      const adminsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAdmins(adminsList);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  // Debounced fetch function for user input
  const debouncedFetchUser = useCallback(
    debounce(async (email) => {
      if (email === '') {
        setUser(null);
        return;
      }

      try {
        setIsLoading(true);
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const fetchedUser = querySnapshot.docs[0].data();
          setUser({ id: querySnapshot.docs[0].id, ...fetchedUser });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setIsLoading(false);
      }
    }, 3000),
    []
  );

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    debouncedFetchUser(e.target.value);
  };

  const handleAssignAdmin = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { admin: true });
      toast.success('User assigned as Admin successfully!', { autoClose: 2000 });
      setUser({ ...user, admin: true });
      fetchAdmins(); // Refresh the list of admins after assigning
    } catch (error) {
      console.error('Error assigning admin:', error);
      toast.error('Failed to assign Admin.', { autoClose: 2000 });
    }
  };

  const handleRevokeAdmin = async (adminId) => {
    try {
      const adminRef = doc(db, 'users', adminId);
      await updateDoc(adminRef, { admin: false });
      toast.success('Admin power revoked successfully!', { autoClose: 2000 });
      fetchAdmins(); // Refresh the list of admins after revoking
    } catch (error) {
      console.error('Error revoking admin power:', error);
      toast.error('Failed to revoke admin power.', { autoClose: 2000 });
    }
  };

  const handleStepDownAsAdmin = async () => {
    if (!currentUser) return;

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, { admin: false });
      toast.success('Stepped down as Admin successfully!', { autoClose: 2000 });
      navigate('/'); // Navigate to the login page after stepping down
    } catch (error) {
      console.error('Error stepping down as admin:', error);
      toast.error('Failed to step down as Admin.', { autoClose: 2000 });
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="max-w-7xl sm:max-w-4xl md:max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-green-400 to-blue-500 p-1 rounded-xl shadow-xl mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-3 sm:p-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center">
              <UserCheck className="mr-2 sm:mr-3 text-blue-500" size={24} />
              Assign Admin
            </h2>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="p-2 sm:p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter user's email to assign as admin"
            required
          />
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Checking for users... <span className="dot-flashing"></span></p>
        ) : (
          user && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h3 className="text-lg font-semibold mb-2">{user.name || 'Unnamed User'}</h3>
              <p className="text-sm text-gray-600 mb-2">{user.email}</p>
              <p className="text-sm text-gray-600 mb-4">
                {user.admin ? (
                  <CheckCircle className="text-green-500 inline" size={20} />
                ) : (
                  <XCircle className="text-red-500 inline" size={20} />
                )}{' '}
                {user.admin ? 'Already an Admin' : 'Not an Admin'}
              </p>
              <button
                onClick={handleAssignAdmin}
                className="w-full p-2 sm:p-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:from-green-500 hover:to-blue-600 text-sm sm:text-base"
                disabled={user.admin}
              >
                Assign Admin
              </button>
            </div>
          )
        )}

        {currentUser && (
          <button
            onClick={handleStepDownAsAdmin}
            className="w-full p-2 sm:p-3 bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:bg-red-600 text-sm sm:text-base"
          >
            Step Down as Admin
          </button>
        )}

        <div className="mt-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Current Admins</h3>
          {admins.length > 0 ? (
            <ul className="space-y-4">
              {admins.map((admin) => (
                <li
                key={admin.id}
                className="bg-white p-3 sm:p-4 rounded-xl shadow-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-3" size={24} />
                  <div>
                    <h4 className="font-semibold text-base sm:text-lg text-gray-800">{admin.name || 'Unnamed User'}</h4>
                    <p className="text-gray-600 text-sm">{admin.email}</p>
                  </div>
                </div>
                {currentUser?.uid !== admin.id && ( // Do not show button for current logged-in user
                  <button
                    onClick={() => handleRevokeAdmin(admin.id)}
                    className="flex items-center bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="mr-2" size={16} />
                    Revoke Admin Power
                  </button>
                )}
              </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 text-sm sm:text-base">No admins available.</p>
          )}
        </div>
      </div>
      {/* Inline CSS for the loading animation */}
      <style>{`
        .dot-flashing {
          position: relative;
          width: 4px;
          height: 4px;
          border-radius: 2px;
          background-color: currentColor;
          color: #3b82f6;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: .5s;
        }

        .dot-flashing::before, .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          width: 4px;
          height: 4px;
          border-radius: 2px;
          background-color: currentColor;
          color: #3b82f6;
          animation: dot-flashing 1s infinite alternate;
        }

        .dot-flashing::before {
          left: -6px;
          animation-delay: 0s;
        }

        .dot-flashing::after {
          left: 6px;
          animation-delay: 1s;
        }

        @keyframes dot-flashing {
          0% {
            background-color: #3b82f6;
          }
          50%, 100% {
            background-color: rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>
    </div>
  );
};

// Debounce utility function
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, 2000);
  };
}

export default AssignAdmin;
