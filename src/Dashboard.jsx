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

const recommendCrops = (avg, cropData) => {
  return cropData.filter(crop => {
    if (
      crop &&
      crop.temperature &&
      crop.humidity &&
      crop.soilMoisture &&
      typeof crop.temperature.min === 'number' &&
      typeof crop.temperature.max === 'number' &&
      typeof crop.humidity.min === 'number' &&
      typeof crop.humidity.max === 'number' &&
      typeof crop.soilMoisture.min === 'number' &&
      typeof crop.soilMoisture.max === 'number'
    ) {
      return (
        avg.temperature >= crop.temperature.min &&
        avg.temperature <= crop.temperature.max &&
        avg.humidity >= crop.humidity.min &&
        avg.humidity <= crop.humidity.max &&
        avg.soilMoisture >= crop.soilMoisture.min &&
        avg.soilMoisture <= crop.soilMoisture.max
      );
    }
    return false;
  });
};

const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState({ temperature: 0, humidity: 0, soilMoisture: 0 });
  const [history, setHistory] = useState([]);
  const [notification, setNotification] = useState("");
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");

  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  }

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
    // Hide the confirmation dialog
    setShowLogoutConfirm(false);
  };

  // Fetch sensor data
  useEffect(() => {
    const dataRef = ref(database, 'sensorData');

    const fetchData = () => {
      onValue(dataRef, (snapshot) => {
        if (snapshot.exists()) {
          const newData = snapshot.val();
          setData(newData);

          const now = Date.now();
          const historyRef = ref(database, 'sensorHistory');
          const entry = { ...newData, timestamp: now };
          push(historyRef, entry);

          setHistory(prev => [...prev.slice(-9), { ...newData, time: new Date().toLocaleTimeString() }]);

          if (newData.temperature > 35) {
            setNotification(t('temperatureHighWarning'));
          } else if (newData.soilMoisture < 30) {
            setNotification(t('soilDryWarning'));
          } else {
            setNotification("");
          }
        }
      }, { onlyOnce: true });
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [t]);

  // Calculate crop recommendation based on history
  useEffect(() => {
    if (history.length < 3) return;

    const sum = history.reduce((acc, item) => ({
      temperature: acc.temperature + item.temperature,
      humidity: acc.humidity + item.humidity,
      soilMoisture: acc.soilMoisture + item.soilMoisture,
    }), { temperature: 0, humidity: 0, soilMoisture: 0 });

    const avg = {
      temperature: parseFloat((sum.temperature / history.length).toFixed(1)),
      humidity: parseFloat((sum.humidity / history.length).toFixed(1)),
      soilMoisture: parseFloat((sum.soilMoisture / history.length).toFixed(1)),
    };

    const recommended = recommendCrops(avg, cropData);
    setRecommendedCrops(recommended);

    if (recommended.length > 0) {
      const adviceRef = ref(database, 'cropAdvice');
      const adviceEntry = {
        timestamp: Date.now(),
        averageData: avg,
        recommendedCrops: recommended
      };
      push(adviceRef, adviceEntry);
    }
  }, [history]);

  // Leaf Disease Detector
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPrediction(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(t('selectImageError'));
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('predictionFailed'));
      }

      setPrediction({
        disease: data.disease,
        reason: data.reason,
        solution: data.solution
      });
    } catch (err) {
      console.error("Error during prediction:", err);
      setError(t('predictionError'));
    }
  };

  return (
    <div className={`dashboard-container- ${darkMode ? 'dark-' : ''}`}>
      <button className="dark-mode-toggle-" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? t('lightMode') : t('darkMode')}
      </button>

      <nav className="navbarreport">
      <h2 className="navbar-titlereport">🌿 {t('navTitle')}</h2>
        <ul className="navbar-listreport">
          <li className="navbar-itemreport">{t('dashboard')}</li>
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
          <div className="user-info-">
          <button onClick={handleLogoutClick} className="logout-button-">
            {t('logout') || 'Logout'}
          </button>
        </div>

        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay-">
          <div className="logout-confirm-dialog-">
            <h3 className="logout-dialog-title-">{t('confirmLogout') || 'Confirm Logout'}</h3>
            <p className="logout-dialog-message-">{t('logoutConfirmMessage') || 'Are you sure you want to logout?'}</p>
            <div className="logout-confirm-buttons-">
              <button 
                className="confirm-logout-btn-" 
                onClick={handleConfirmLogout}
              >
                {t('yesLogout') || 'Yes, Logout'}
              </button>
              <button 
                className="cancel-logout-btn-" 
                onClick={handleCancelLogout}
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
          <p className="label-">🌡 {t('temperature')}</p>
          <h2 className="value-">{data.temperature} °C</h2>
        </div>
        <div className="data-card- humidity-">
          <p className="label-">💧 {t('humidity')}</p>
          <h2 className="value-">{data.humidity} %</h2>
        </div>
        <div className="data-card- soil-moisture-">
          <p className="label-">🌱 {t('soilMoisture')}</p>
          <h2 className="value-">{data.soilMoisture}</h2>
        </div>
      </div>

      <div className="chart-container-">
        <h3 className="chart-title-">📈 {t('sensorDataChart')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#fb8c00" name={t('temperature')} />
            <Line type="monotone" dataKey="humidity" stroke="#1e88e5" name={t('humidity')} />
            <Line type="monotone" dataKey="soilMoisture" stroke="#43a047" name={t('soilMoisture')} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {recommendedCrops.length > 0 && (
        <div className="recommendation-section-">
          <h3 className="recommendation-title-">🌱 {t('cropRecommendations')}</h3>
          <ul className="crop-list-">
            {recommendedCrops.map((crop, index) => (
              <li key={index} className="crop-item-">
                <strong className="crop-name-">{crop.name}</strong> - {t('suitabilityScore')}: {crop.suitabilityScore || '85%'}
              </li>
            ))}
          </ul>
          <p className="recommendation-note-">{t('recommendationNote')}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;