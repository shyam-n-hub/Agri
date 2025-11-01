import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import './Report.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [currentData, setCurrentData] = useState(null);
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
    setShowLogoutConfirm(true);
  };
  
  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('uid');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('firebaseAuthUser');
      localStorage.removeItem('userEmail');
      
      if (onLogout) {
        onLogout();
      }
      
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Listen to real-time current data
  useEffect(() => {
    const sensorRef = ref(database, 'SensorData/');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        const newData = snapshot.val();
        setCurrentData({
          temperature: newData.temperature,
          humidity: newData.humidity,
          soilPercent: newData.soilPercent || 0, // Changed from soilMoisture to soilPercent
          timestamp: Date.now(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString()
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to historical data
  useEffect(() => {
    const historyRef = ref(database, 'sensorHistory/');
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allEntries = Object.values(data)
          .map(item => ({
            ...item,
            soilPercent: item.soilPercent || 0, // Ensure soilPercent is used
            date: new Date(item.timestamp).toLocaleDateString(),
            time: new Date(item.timestamp).toLocaleTimeString()
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setHistory(allEntries);
      }
    });
  }, []);

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = [];
    
    // Add current data as first row
    if (currentData) {
      dataToExport.push({
        Date: currentData.date,
        Time: currentData.time,
        'Temperature (°C)': currentData.temperature,
        'Humidity (%)': currentData.humidity,
        'Soil Moisture (%)': currentData.soilPercent, // Changed label
        Status: 'Current'
      });
    }

    // Add historical data
    history.forEach(item => {
      dataToExport.push({
        Date: item.date,
        Time: item.time,
        'Temperature (°C)': item.temperature,
        'Humidity (%)': item.humidity,
        'Soil Moisture (%)': item.soilPercent, // Changed to soilPercent
        Status: 'Historical'
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sensor Data');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 15 },
      { wch: 18 }, // Increased width for percentage
      { wch: 12 }
    ];

    XLSX.writeFile(workbook, `Sensor_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Agricultural Sensor Data Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    
    // Prepare table data
    const tableData = [];
    
    // Add current data as first row
    if (currentData) {
      tableData.push([
        currentData.date,
        currentData.time,
        currentData.temperature,
        currentData.humidity,
        currentData.soilPercent, // Changed to soilPercent
        'Current'
      ]);
    }

    // Add historical data
    history.forEach(item => {
      tableData.push([
        item.date,
        item.time,
        item.temperature,
        item.humidity,
        item.soilPercent, // Changed to soilPercent
        'Historical'
      ]);
    });

    // Add table using autoTable
    autoTable(doc, {
      head: [['Date', 'Time', 'Temp (°C)', 'Humidity (%)', 'Soil Moisture (%)', 'Status']], // Added % to header
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [67, 160, 71] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 }
    });

    doc.save(`Sensor_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="report-containerreport">
      <nav className={`navbarreport ${isScrolled ? 'navbar-hiddenreport' : ''}`}>
        <h2 className="navbar-titlereport">🌿 {t('Agri Assist')}</h2>
        <ul className="navbar-listreport">
          <li className="navbar-itemreport" onClick={() => navigate('/')}>{t('Sensor_Dashboard')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/report')}>{t('Sensor_Reports')}</li>
          <li className="navbar-itemreport" onClick={() => navigate('/airecommendation')}>{t('Crop_Recommendations')}</li>
          {/* <li className="navbar-itemreport" onClick={() => navigate('/leaf-detector')}>{t('leafDetector')}</li> */}
        </ul>
        {/* <div className="user-controlsreport">
          <div className="language-selectorreport">
            <select className="language-selectreport" onChange={handleLanguageChange} defaultValue={i18n.language}>
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div> */}
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
        <h2 className="report-titlereport">📊 {t('Sensor_Full_History')} </h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={exportToExcel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#43a047',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📥 Export to Excel
          </button>
          <button 
            onClick={exportToPDF}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fb8c00',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            📄 Export to PDF
          </button>
        </div>
      </div>
      
      <div className="report-table-containerreport">
        <div className="table-wrapperreport">
          <table className="report-tablereport">
            <thead className="table-headreport">
              <tr className="table-headerrowreport">
                <th className="table-headerreport">{t('Date') || 'Date'}</th>
                <th className="table-headerreport">{t('Time')}</th>
                <th className="table-headerreport">{t('Temperature')} (°C)</th>
                <th className="table-headerreport">{t('Humidity')} (%)</th>
                <th className="table-headerreport">{t('SoilMoisture')} (%)</th>
                <th className="table-headerreport">Status</th>
              </tr>
            </thead>
            <tbody className="table-bodyreport">
              {currentData && (
                <tr className="table-rowreport" style={{ backgroundColor: '#e8f5e9', fontWeight: 'bold' }}>
                  <td className="table-cellreport">{currentData.date}</td>
                  <td className="table-cellreport">{currentData.time}</td>
                  <td className="table-cellreport temperature-cellreport">{currentData.temperature}</td>
                  <td className="table-cellreport humidity-cellreport">{currentData.humidity}</td>
                  <td className="table-cellreport moisture-cellreport">{currentData.soilPercent}%</td>
                  <td className="table-cellreport" style={{ color: '#43a047', fontWeight: 'bold' }}>
                    🔴 Live
                  </td>
                </tr>
              )}
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <tr key={idx} className="table-rowreport">
                    <td className="table-cellreport">{item.date}</td>
                    <td className="table-cellreport">{item.time}</td>
                    <td className="table-cellreport temperature-cellreport">{item.temperature}</td>
                    <td className="table-cellreport humidity-cellreport">{item.humidity}</td>
                    <td className="table-cellreport moisture-cellreport">{item.soilPercent}%</td>
                    <td className="table-cellreport" style={{ color: '#757575' }}>Historical</td>
                  </tr>
                ))
              ) : (
                !currentData && (
                  <tr className="empty-rowreport">
                    <td colSpan="6" className="empty-messagereport">No data available</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report;