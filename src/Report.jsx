import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import './Report.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaxYM2c7n1cTKg3TM5YyP3fXwnS3klQDA",
  authDomain: "agri-86e71.firebaseapp.com",
  databaseURL: "https://agri-86e71-default-rtdb.firebaseio.com",
  projectId: "agri-86e71",
  storageBucket: "agri-86e71.appspot.com",
  messagingSenderId: "212727396061",
  appId: "1:212727396061:web:0246db84c3638955b40d34",
  measurementId: "G-3XG9ERVWKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const Report = ({ onLogout }) => {
  const [history, setHistory] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogoutClick = () => {
    // Show the confirmation dialog when logout button is clicked
    setShowLogoutConfirm(true);
  };
  
  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      
      // Clear all local storage items related to auth
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('uid');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('firebaseAuthUser');
      localStorage.removeItem('userEmail');
      
      // Call the onLogout prop if it exists
      if (onLogout) {
        onLogout();
      }
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const historyRef = ref(database, 'sensorHistory/');
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allEntries = Object.values(data).sort((a, b) => a.timestamp - b.timestamp); // Sort by time ascending
        setHistory(allEntries);
      }
    });
  }, []);

  return (
    <div className="report-containerreport">
      <nav className={`navbarreport ${isScrolled ? 'navbar-hiddenreport' : ''}`}>
        <h2 className="navbar-titlereport">🌿 {t('navTitle')}</h2>
        <ul className="navbar-listreport">
          <li className="navbar-itemreport" onClick={() => navigate('/')}>{t('dashboard')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/report')}>{t('reports')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/airecommendation')}>{t('ai')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/leaf-detector')}>{t('leafDetector')}</li>
        </ul>
        <div className="user-controlsreport">
          <div className="language-selectorreport">
            <select className="language-selectreport" onChange={handleLanguageChange} defaultValue={i18n.language}>
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
          
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlayreport">
          <div className="logout-confirm-dialogreport">
            <h3 className="logout-dialog-titlereport">{t('confirmLogout') || 'Confirm Logout'}</h3>
            <p className="logout-dialog-messagereport">{t('logoutConfirmMessage') || 'Are you sure you want to logout?'}</p>
            <div className="logout-confirm-buttonsreport">
              <button 
                className="confirm-logout-btnreport" 
                onClick={handleConfirmLogout}
              >
                {t('yesLogout') || 'Yes, Logout'}
              </button>
              <button 
                className="cancel-logout-btnreport" 
                onClick={handleCancelLogout}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="report-header-fixedreport">
        <h2 className="report-titlereport">📊 {t('sensorData')} ({t('fullHistory') || 'Full History'})</h2>
      </div>
      
      <div className="report-table-containerreport">
        <div className="table-wrapperreport">
          <table className="report-tablereport">
            <thead className="table-headreport">
              <tr className="table-headerrowreport">
                <th className="table-headerreport">{t('time')}</th>
                <th className="table-headerreport">{t('temperature')} (°C)</th>
                <th className="table-headerreport">{t('humidity')} (%)</th>
                <th className="table-headerreport">{t('soilMoisture')}</th>
              </tr>
            </thead>
            <tbody className="table-bodyreport">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <tr key={idx} className="table-rowreport">
                    <td className="table-cellreport">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td className="table-cellreport temperature-cellreport">{item.temperature}</td>
                    <td className="table-cellreport humidity-cellreport">{item.humidity}</td>
                    <td className="table-cellreport moisture-cellreport">{item.soilMoisture}</td>
                  </tr>
                ))
              ) : (
                <tr className="empty-rowreport">
                  <td colSpan="4" className="empty-messagereport">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;