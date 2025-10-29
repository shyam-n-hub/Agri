import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';
import cropData from './data/cropData.json';
import { useNavigate } from 'react-router-dom';
import './i18n';
import { useTranslation } from 'react-i18next';

// ✅ Firebase configuration
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ✅ Function: Recommend crops based on averages
const recommendCrops = (avg, cropData) => {
  return cropData.filter(crop => {
    if (
      crop?.temperature && crop?.humidity && crop?.soilMoisture &&
      typeof crop.temperature.min === 'number' &&
      typeof crop.temperature.max === 'number'
    ) {
      return (
        avg.temperature >= crop.temperature.min &&
        avg.temperature <= crop.temperature.max &&
        avg.humidity >= crop.humidity.min &&
        avg.humidity <= crop.humidity.max &&
        avg.soilPercent >= crop.soilMoisture.min &&
        avg.soilPercent <= crop.soilMoisture.max
      );
    }
    return false;
  });
};

const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState({ temperature: 0, humidity: 0, soilMoisture: 0, soilPercent: 0 });
  const [history, setHistory] = useState([]);
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [notification, setNotification] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // 🧠 Fetch user email
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) setUserEmail(email);
  }, []);

  // 🌍 Language change
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  // 🚪 Logout handling - FIXED VERSION
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear all localStorage items
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('uid');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('firebaseAuthUser');
      
      // Call onLogout callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Close the modal
      setShowLogoutConfirm(false);
      
      // Navigate to login page
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to logout. Please try again.");
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // 📡 Real-time sensor listener
  useEffect(() => {
    const sensorRef = ref(database, 'SensorData/');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const newData = snapshot.val();
        setData(newData);

        // Store to local history (last 10 readings)
        const entry = {
          temperature: newData.temperature,
          humidity: newData.humidity,
          soilMoisture: newData.soilMoisture,
          soilPercent: newData.soilPercent || 0,
          time: new Date().toLocaleTimeString(),
        };
        setHistory(prev => [...prev.slice(-9), entry]);

        // Notifications - using soilPercent instead of soilMoisture
        if (newData.temperature > 35) setNotification(t('temperatureHighWarning'));
        else if ((newData.soilPercent || 0) < 30) setNotification(t('soilDryWarning'));
        else setNotification("");
      }
    });

    return () => unsubscribe();
  }, [t]);

  // 🤖 Crop recommendation (based on last few readings)
  useEffect(() => {
    if (history.length < 3) return;

    const sum = history.reduce((acc, item) => ({
      temperature: acc.temperature + item.temperature,
      humidity: acc.humidity + item.humidity,
      soilPercent: acc.soilPercent + item.soilPercent,
    }), { temperature: 0, humidity: 0, soilPercent: 0 });

    const avg = {
      temperature: parseFloat((sum.temperature / history.length).toFixed(1)),
      humidity: parseFloat((sum.humidity / history.length).toFixed(1)),
      soilPercent: parseFloat((sum.soilPercent / history.length).toFixed(1)),
    };

    const recommended = recommendCrops(avg, cropData);
    setRecommendedCrops(recommended);

    // Save AI advice to Firebase
    if (recommended.length > 0) {
      const adviceRef = ref(database, 'cropAdvice');
      push(adviceRef, {
        timestamp: Date.now(),
        averageData: avg,
        recommendedCrops: recommended,
      });
    }
  }, [history]);

  // 🌿 UI
  return (
    <div className={`dashboard-container- ${darkMode ? 'dark' : ''}`}>
      <button className="dark-mode-toggle-" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? t('lightMode') : t('darkMode')}
      </button>

      <nav className="navbarreport">
        <h2 className="navbar-titlereport">🌿 {t('navTitle')}</h2>
        <ul className="navbar-listreport">
          <li className="navbar-itemreport">{t('dashboard')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/report')}>{t('reports')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/airecommendation')}>{t('ai')}</li>
          <li className="navbar-itemreport">
            <button onClick={handleLogoutClick} className="logout-button" disabled={isLoggingOut}>
              {isLoggingOut ? t('loggingOut') || 'Logging out...' : t('logout') || 'Logout'}
            </button>
          </li>
        </ul>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-dialog">
            <h3>{t('confirmLogout') || 'Confirm Logout'}</h3>
            <p>{t('logoutConfirmMessage') || 'Are you sure you want to logout?'}</p>
            <div className="logout-confirm-buttons">
              <button 
                onClick={handleConfirmLogout} 
                className="confirm-yes"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? t('loggingOut') || 'Logging out...' : t('yesLogout') || 'Yes, Logout'}
              </button>
              <button 
                onClick={handleCancelLogout} 
                className="confirm-no"
                disabled={isLoggingOut}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="dashboard-title-">🌾 {t('title')}</h1>
      {notification && <div className="notification-">{notification}</div>}

      <div className="card-grid-">
        <div className="data-card- temperature-">
          <p>🌡 {t('temperature')}</p>
          <h2>{data.temperature} °C</h2>
        </div>
        <div className="data-card- humidity-">
          <p>💧 {t('humidity')}</p>
          <h2>{data.humidity} %</h2>
        </div>
        <div className="data-card- soil-moisture-">
          <p>🌱 {t('soilMoisture')}</p>
          <h2>{data.soilPercent} %</h2>
        </div>
      </div>

      <div className="chart-container">
        <h3>📈 {t('sensorDataChart')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#fb8c00" name={t('temperature')} />
            <Line type="monotone" dataKey="humidity" stroke="#1e88e5" name={t('humidity')} />
            <Line type="monotone" dataKey="soilPercent" stroke="#43a047" name={t('soilMoisture')} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {recommendedCrops.length > 0 && (
        <div className="recommendation-section">
          <h3>🌱 {t('cropRecommendations')}</h3>
          <ul>
            {recommendedCrops.map((crop, index) => (
              <li key={index}>
                <strong>{crop.name}</strong> — {t('yieldPeriod')}: {crop.yieldPeriod}, {t('costEstimate')}: {crop.costEstimate}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;