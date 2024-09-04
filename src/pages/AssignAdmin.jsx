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
  const [isAdminsLoading, setIsAdminsLoading] = useState(true);
  const [matchingEmails, setMatchingEmails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    fetchAdmins();

    return () => unsubscribe();
  }, []);

  const fetchAdmins = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('admin', '==', true));
      const querySnapshot = await getDocs(q);
      const adminsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTimeout(() => {
        setAdmins(adminsList);
        setIsAdminsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setIsAdminsLoading(false);
    }
  };

  const debouncedFetchMatchingEmails = useCallback(
    debounce(async (email) => {
      if (email === '') {
        setMatchingEmails([]);
        setUser(null);
        return;
      }

      try {
        const lowercasedEmail = email.toLowerCase();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '>=', lowercasedEmail), where('email', '<=', lowercasedEmail + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const emails = querySnapshot.docs.map((doc) => doc.data().email);
        setMatchingEmails(emails);
      } catch (error) {
        console.error('Error fetching matching emails:', error);
      }
    }, 300),
    []
  );

  const handleEmailChange = (e) => {
    const newEmail = e.target.value.toLowerCase();
    setEmail(newEmail);
    debouncedFetchMatchingEmails(newEmail);
  };

  const handleSelectEmail = (selectedEmail) => {
    setEmail(selectedEmail.toLowerCase());
    setMatchingEmails([]);
    debouncedFetchUser(selectedEmail);
  };

  const debouncedFetchUser = useCallback(
    debounce(async (email) => {
      if (email === '') {
        setUser(null);
        return;
      }

      try {
        setIsLoading(true);
        const lowercasedEmail = email.toLowerCase();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', lowercasedEmail));
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

  const handleAssignAdmin = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { admin: true });
      toast.success('User assigned as Admin successfully!', { autoClose: 2000 });
      setUser({ ...user, admin: true });
      fetchAdmins();
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
      fetchAdmins();
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
      navigate('/');
    } catch (error) {
      console.error('Error stepping down as admin:', error);
      toast.error('Failed to step down as Admin.', { autoClose: 2000 });
    }
  };

  if (isAdminsLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-2xl">
          <p className="text-lg sm:text-xl font-semibold text-gray-800 text-center">Loading Admins...</p>
          <div className="mt-3 w-8 h-8 sm:w-10 sm:h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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

        <div className="mb-4 sm:mb-6 space-y-3 relative">
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="p-2 sm:p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Enter user's email to assign as admin"
            required
          />
          {matchingEmails.length > 0 && (
            <ul className="absolute z-10 bg-white border rounded-lg w-full mt-1 max-h-40 overflow-y-auto shadow-md">
              {matchingEmails.map((matchingEmail) => (
                <li
                  key={matchingEmail}
                  className="p-2 cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSelectEmail(matchingEmail)}
                >
                  {matchingEmail}
                </li>
              ))}
            </ul>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 shimmer">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
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
                className={`w-full p-2 sm:p-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-300 text-sm sm:text-base ${
                  user.admin
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600'
                }`}
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
            className="w-full p-2 sm:p-3 bg-red-500 text-white rounded-lg font-semibold flex items-center justify-center transition-all duration-300 hover:bg-red-600 text-sm sm:text-base mb-4 sm:mb-6"
          >
            Step Down as Admin
          </button>
        )}

        <div className="mt-4 sm:mt-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Current Admins</h3>
          {admins.length > 0 ? (
            <ul className="space-y-4">
              {admins.map((admin) => (
                <li
                  key={admin.id}
                  className="bg-white p-3 sm:p-4 rounded-xl shadow-md flex items-center justify-between transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-3" size={24} />
                    <div>
                      <h4 className="font-semibold text-base sm:text-lg text-gray-800">{admin.name || 'Unnamed User'}</h4>
                      <p className="text-gray-600 text-sm">{admin.email}</p>
                    </div>
                  </div>
                  {currentUser?.uid !== admin.id && (
                    <button
                      onClick={() => handleRevokeAdmin(admin.id)}
                      className="flex items-center bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base"
                    >
                      <Trash2 className="" size={16} />
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

        /* Shimmer effect */
        .shimmer {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default AssignAdmin;
