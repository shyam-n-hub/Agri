import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ darkMode, handleLanguageChange }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  // Get current path to highlight active nav item
  const currentPath = window.location.pathname;
  
  return (
    <div className="sidebar-">
      <div className="app-logo-">
        <span role="img" aria-label="Plant">🌿</span>
        <span>AgriNav</span>
      </div>
      
      <div className="sidebar-nav-">
        <div 
          className={`nav-item- ${currentPath === '/' || currentPath === '/dashboard' ? 'active-' : ''}`}
          onClick={() => navigate('/')}
        >
          <span role="img" aria-label="Dashboard">📊</span>
          <span>{t('dashboard')}</span>
        </div>
        
        <div 
          className={`nav-item- ${currentPath === '/report' ? 'active-' : ''}`}
          onClick={() => navigate('/report')}
        >
          <span role="img" aria-label="Reports">📝</span>
          <span>{t('reports')}</span>
        </div>
        
        <div 
          className={`nav-item- ${currentPath === '/airecommendation' ? 'active-' : ''}`}
          onClick={() => navigate('/airecommendation')}
        >
          <span role="img" aria-label="AI">🤖</span>
          <span>{t('ai')}</span>
        </div>
        
        <div 
          className={`nav-item- ${currentPath === '/leaf-detector' ? 'active-' : ''}`}
          onClick={() => navigate('/leaf-detector')}
        >
          <span role="img" aria-label="Leaf">🍃</span>
          <span>{t('leafDetector')}</span>
        </div>
      </div>
      
      <div className="language-selector-">
        <select 
          className="language-select-" 
          onChange={handleLanguageChange}

          defaultValue={i18n.language}
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>
    </div>
  );
};

export default Sidebar;