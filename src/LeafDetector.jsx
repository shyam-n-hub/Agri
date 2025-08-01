import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAuth, signOut } from 'firebase/auth'; // Import auth functions
import './LeafDetector.css';
import './i18n';

const LeafDetector = () => {
  const { t, i18n } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(); // Get Firebase Auth
  
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
    <div className={`leaf-detector-containerleaf ${darkMode ? 'darkleaf' : ''}`}>
     
      
      <nav className="navbarreport">
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
          {/* <div className="user-infoleaf">
            <button onClick={handleLogoutClick} className="logout-buttonleaf">
              {t('logout') || 'Logout'}
            </button>
          </div> */}
        </div>
      </nav>
      
      {showLogoutConfirm && (
        <div className="logout-confirm-overlayleaf">
          <div className="logout-confirm-dialogleaf">
            <h3 className="logout-dialog-titleleaf">{t('confirmLogout') || 'Confirm Logout'}</h3>
            <p className="logout-dialog-messageleaf">{t('logoutConfirmMessage') || 'Are you sure you want to logout?'}</p>
            <div className="logout-confirm-buttonsleaf">
              <button 
                className="confirm-logout-btnleaf" 
                onClick={handleConfirmLogout}
              >
                {t('yesLogout') || 'Yes, Logout'}
              </button>
              <button 
                className="cancel-logout-btnleaf" 
                onClick={handleCancelLogout}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="titleleaf">🌿 {t('leafDisease')}</h1>
      
      <div className="upload-sectionleaf">
        <div className="file-input-containerleaf">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-inputleaf"
            aria-label={t('selectImage')}
            id="file-input"
          />
          <label className="file-input-labelleaf" htmlFor="file-input">
            {t('selectImage')}
          </label>
        </div>
        
        {previewUrl && (
          <div className="image-previewleaf">
            <img
              src={previewUrl}
              alt={t('selectedLeafImage')}
              className="preview-imgleaf"
            />
          </div>
        )}
        
        <button 
          className="predict-buttonleaf"
          onClick={handleUpload}
          disabled={!selectedFile}
        >
          {t('predict')}
        </button>
        
        {error && <p className="error-messageleaf">{error}</p>}
        
        {prediction && (
          <div className="prediction-resultleaf">
            <div className="prediction-headerleaf">
              <span className="prediction-iconleaf">🔍</span>
              <h3 className="disease-nameleaf">{prediction.disease}</h3>
            </div>
            
            <div className="prediction-sectionleaf">
              <h4 className="section-titleleaf">{t('reason')}:</h4>
              <p className="section-contentleaf">{prediction.reason}</p>
            </div>
            
            <div className="prediction-sectionleaf solution-sectionleaf">
              <h4 className="section-titleleaf">{t('solution')}:</h4>
              <p className="section-contentleaf">{prediction.solution}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeafDetector;