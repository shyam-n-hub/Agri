import React, { useState, useEffect } from 'react';
import './AiRecommendation.css';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AiRecommendation = ({ onLogout }) => {
  const [advice, setAdvice] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const database = getDatabase();
  const auth = getAuth();

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  useEffect(() => {
    const adviceRef = ref(database, 'cropAdvice/');
    const unsubscribe = onValue(adviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert object to array and sort by timestamp (latest first)
        const allAdvice = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setAdvice(allAdvice);
      }
    });
    return () => unsubscribe(); // Cleanup
  }, [database]);

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
    // Hide the confirmation dialog
    setShowLogoutConfirm(false);
  };

  return (
    <div className={`report-containerai ${darkMode ? 'darkai' : ''}`}>
      <button className="dark-mode-toggleai" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? t('lightMode') : t('darkMode')}
      </button>

      <nav className="navbarreport">
      <h2 className="navbar-titlereport">🌿 {t('navTitle')}</h2>
        <ul className="navbar-listreport">
          <li className="navbar-itemreport" onClick={() => navigate('/')}>{t('dashboard')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/report')}>{t('reports')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/airecommendation')}>{t('ai')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/leaf-detector')}>{t('leafDetector')}</li>
        </ul>
        <div className="user-controlsai">
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlayai">
          <div className="logout-confirm-dialogai">
            <h3 className="logout-titleai">{t('confirmLogout') || 'Confirm Logout'}</h3>
            <p className="logout-messageai">{t('logoutConfirmMessage') || 'Are you sure you want to logout?'}</p>
            <div className="logout-confirm-buttonsai">
              <button 
                className="confirm-logout-btnai" 
                onClick={handleConfirmLogout}
              >
                {t('yesLogout') || 'Yes, Logout'}
              </button>
              <button 
                className="cancel-logout-btnai" 
                onClick={handleCancelLogout}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="page-titleai">🧠 {t('aiRecommendationTitle') || 'AI Crop Recommendations (All History)'}</h2>

      {advice.length === 0 ? (
        <div className="no-dataai">{t('noCropRecommendation') || 'No crop recommendation available.'}</div>
      ) : (
        advice.map((entry, idx) => (
          <div className="advice-cardai" key={idx}>
            <div className="card-headerai">
              <p className="header-textai"><strong>{t('time') || 'Time'}:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
            </div>
            
            <div className="sensor-dataai">
              <p className="sensor-textai"><strong>{t('avgTemperature') || 'Avg Temperature'}:</strong> {entry.averageData?.temperature} °C</p>
              <p className="sensor-textai"><strong>{t('avgHumidity') || 'Avg Humidity'}:</strong> {entry.averageData?.humidity} %</p>
              <p className="sensor-textai"><strong>{t('avgSoilMoisture') || 'Avg Soil Moisture'}:</strong> {entry.averageData?.soilMoisture}</p>
            </div>

            {entry.recommendedCrops?.length > 0 ? (
              entry.recommendedCrops.map((crop, i) => (
                <div key={i} className="crop-detailai">
                  <h3 className="crop-nameai">{crop.name || crop.crop}</h3>
                  <div className="crop-statsai">
                    <p className="crop-statai"><strong>{t('temperature') || 'Temperature'} Range:</strong> {crop.temperature?.min} - {crop.temperature?.max} °C</p>
                    <p className="crop-statai"><strong>{t('humidity') || 'Humidity'} Range:</strong> {crop.humidity?.min} - {crop.humidity?.max} %</p>
                    <p className="crop-statai"><strong>{t('soilMoisture') || 'Soil Moisture'} Range:</strong> {crop.soilMoisture?.min} - {crop.soilMoisture?.max}</p>
                    
                    <p className="crop-statai">
                      <strong>{t('waterNeeds') || 'Water Needs'}:</strong> {crop.waterNeeds}
                      <span className={`water-badgeai ${crop.waterNeeds?.toLowerCase()}ai`}>
                        {crop.waterNeeds}
                      </span>
                    </p>
                    
                    <p className="crop-statai"><strong>{t('yieldPeriod') || 'Yield Period'}:</strong> {crop.yieldPeriod}</p>
                    <p className="crop-statai"><strong>{t('costEstimate') || 'Cost Estimate'}:</strong> {crop.costEstimate}</p>
                    
                    <div className="fertilizers-sectionai">
                      <p className="fertilizer-titleai"><strong>{t('recommendedFertilizers') || 'Recommended Fertilizers'}:</strong></p>
                      <div className="fertilizer-tagsai">
                        {crop.fertilizers?.map((fertilizer, fIdx) => (
                          <span key={fIdx} className="fertilizer-tagai">{fertilizer}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-dataai"><em>{t('noCropRecommendationEntry') || 'No crop recommendation available for this entry.'}</em></p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AiRecommendation;