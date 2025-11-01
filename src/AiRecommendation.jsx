// src/components/AiRecommendation.jsx
import React, { useState, useEffect } from "react";
import "./AiRecommendation.css";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AiRecommendation = ({ onLogout }) => {
  const [advice, setAdvice] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [cropData, setCropData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCrops, setShowAllCrops] = useState(false);

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const database = getDatabase();
  const auth = getAuth();

  // 🟢 Fetch user email from localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);
  }, []);

  // 🟢 Fetch live sensor data from Firebase
  useEffect(() => {
    const sensorRef = ref(database, "SensorData/");
    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log("Sensor Data:", data);
          setSensorData(data);
        } else {
          console.warn("No sensor data available");
          setSensorData({});
        }
      },
      (error) => {
        console.error("Error fetching sensor data:", error);
        setError("Failed to fetch sensor data");
      }
    );
    return () => unsubscribe();
  }, [database]);

  // 🟢 Fetch crop dataset from Firebase
  useEffect(() => {
    const cropRef = ref(database, "CropData/");
    const unsubscribe = onValue(
      cropRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Raw Crop Data:", data);
        
        if (data) {
          let crops = [];
          
          // Handle both array and object structures
          if (Array.isArray(data)) {
            crops = data;
          } else if (typeof data === 'object') {
            // Convert object to array
            crops = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
          }
          
          console.log("Processed Crops:", crops);
          setCropData(crops);
          setLoading(false);
        } else {
          console.warn("No crop data available");
          setCropData([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching crop data:", error);
        setError("Failed to fetch crop data");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [database]);

  // 🧠 Generate AI-based recommendations based on sensor data
  useEffect(() => {
    if (!sensorData || Object.keys(sensorData).length === 0 || !cropData.length) {
      console.log("Waiting for data...", { sensorData, cropDataLength: cropData.length });
      return;
    }

    // Parse sensor values - NOW USING soilPercent instead of soilMoisture
    const avgTemp = parseFloat(sensorData.temperature || sensorData.Temperature || 0);
    const avgHum = parseFloat(sensorData.humidity || sensorData.Humidity || 0);
    const avgSoil = parseFloat(sensorData.soilPercent || sensorData.SoilPercent || 0);

    console.log("Parsed Sensor Values:", { avgTemp, avgHum, avgSoil });

    const matchingCrops = cropData.filter((crop) => {
      // Handle different possible field names
      const tempRange = crop.temperatureRange || crop.TemperatureRange || [];
      const humRange = crop.humidityRange || crop.HumidityRange || [];
      const soilRange = crop.soilMoistureRange || crop.SoilMoistureRange || crop.soilPercentRange || crop.SoilPercentRange || [];

      const [tMin, tMax] = tempRange.length === 2 ? tempRange : [0, 100];
      const [hMin, hMax] = humRange.length === 2 ? humRange : [0, 100];
      const [sMin, sMax] = soilRange.length === 2 ? soilRange : [0, 100];

      const tempMatch = avgTemp >= tMin && avgTemp <= tMax;
      const humMatch = avgHum >= hMin && avgHum <= hMax;
      const soilMatch = avgSoil >= sMin && avgSoil <= sMax;

      console.log(`Checking ${crop.crop || crop.name}:`, {
        tempMatch: `${avgTemp} in [${tMin}, ${tMax}] = ${tempMatch}`,
        humMatch: `${avgHum} in [${hMin}, ${hMax}] = ${humMatch}`,
        soilMatch: `${avgSoil} in [${sMin}, ${sMax}] = ${soilMatch}`,
        overall: tempMatch && humMatch && soilMatch
      });

      return tempMatch && humMatch && soilMatch;
    });

    console.log("Matching Crops:", matchingCrops);

    const newAdvice = {
      timestamp: Date.now(),
      averageData: {
        temperature: avgTemp,
        humidity: avgHum,
        soilPercent: avgSoil,
      },
      recommendedCrops: matchingCrops,
    };

    setAdvice([newAdvice]);
    setRecommendedCrops(matchingCrops);
  }, [sensorData, cropData]);

  // 🌐 Handle language change
  const handleLanguageChange = (e) => i18n.changeLanguage(e.target.value);

  // 🚪 Logout handling
  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);
  const handleConfirmLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      if (onLogout) onLogout();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper function to safely get array values
  const getArrayValue = (arr, index, defaultVal = "—") => {
    return arr && Array.isArray(arr) && arr[index] !== undefined ? arr[index] : defaultVal;
  };

  // Helper function to render fertilizers
  const renderFertilizers = (fertilizers) => {
    if (!fertilizers) return null;
    
    let fertArray = [];
    if (Array.isArray(fertilizers)) {
      fertArray = fertilizers;
    } else if (typeof fertilizers === 'object') {
      fertArray = Object.values(fertilizers);
    }
    
    return fertArray;
  };

  // Render crop card
  const renderCropCard = (crop, i, isMatch = true) => {
    const cropName = crop.crop || crop.name || "Unknown Crop";
    const tempRange = crop.temperatureRange || crop.TemperatureRange || [];
    const humRange = crop.humidityRange || crop.HumidityRange || [];
    const soilRange = crop.soilMoistureRange || crop.SoilMoistureRange || crop.soilPercentRange || crop.SoilPercentRange || [];
    const fertilizers = renderFertilizers(crop.fertilizers || crop.Fertilizers);

    return (
      <div className={`advice-cardai ${!isMatch ? 'not-matching' : ''}`} key={i} style={!isMatch ? { opacity: 0.7, border: '2px dashed #ccc' } : {}}>
        <h3 className="crop-nameai">
          {isMatch ? '✅ ' : '❌ '}{cropName}
        </h3>
        <p>🌡️ <strong>Temperature Range:</strong> {getArrayValue(tempRange, 0)} - {getArrayValue(tempRange, 1)} °C</p>
        <p>💧 <strong>Humidity Range:</strong> {getArrayValue(humRange, 0)} - {getArrayValue(humRange, 1)} %</p>
        <p>🌱 <strong>Soil Moisture Range:</strong> {getArrayValue(soilRange, 0)} - {getArrayValue(soilRange, 1)} %</p>
        <p>🚿 <strong>Water Needs:</strong> {crop.waterNeeds || crop.WaterNeeds || "—"}</p>
        <p>🕒 <strong>Yield Period:</strong> {crop.yieldPeriod || crop.YieldPeriod || "—"}</p>
        <p>💰 <strong>Cost Estimate:</strong> {crop.costEstimate || crop.CostEstimate || "—"}</p>
        {fertilizers && fertilizers.length > 0 && (
          <div className="fertilizers-sectionai">
            <strong>Recommended Fertilizers:</strong>
            <div className="fertilizer-tagsai">
              {fertilizers.map((fertilizer, fIdx) => (
                <span key={fIdx} className="fertilizer-tagai">{fertilizer}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`report-containerai ${darkMode ? "darkai" : ""}`}>
        <div className="loading-messageai">⏳ Loading crop data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`report-containerai ${darkMode ? "darkai" : ""}`}>
        <div className="error-messageai">⚠️ {error}</div>
      </div>
    );
  }

  const currentTemp = sensorData.temperature || sensorData.Temperature || 0;
  const currentHum = sensorData.humidity || sensorData.Humidity || 0;
  const currentSoil = sensorData.soilPercent || sensorData.SoilPercent || 0;

  return (
    <div className={`report-containerai ${darkMode ? "darkai" : ""}`}>
      <button
        className="dark-mode-toggleai"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? t("lightMode") : t("darkMode")}
      </button>

      <nav className="navbarreport">
        <h2 className="navbar-titlereport">🌿 {t("navTitle") || "Agri Assist"}</h2>
        <ul className="navbar-listreport">
          <li className="navbar-itemreport" onClick={() => navigate("/")}>
            {t("Sensor_Dashboard")}
          </li>
          <li className="navbar-itemreport" onClick={() => navigate("/report")}>
            {t("Sensor_Reports")}
          </li>
          <li className="navbar-itemreport" onClick={() => navigate("/airecommendation")}>
            {t("Crop_Recommendations")}
          </li>
          {/* <li className="navbar-itemreport" onClick={() => navigate("/leaf-detector")}>
            {t("leafDetector")}
          </li> */}
        </ul>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlayai">
          <div className="logout-confirm-dialogai">
            <h3 className="logout-titleai">{t("confirmLogout") || "Confirm Logout"}</h3>
            <p className="logout-messageai">{t("logoutConfirmMessage") || "Are you sure you want to logout?"}</p>
            <div className="logout-confirm-buttonsai">
              <button className="confirm-logout-btnai" onClick={handleConfirmLogout}>
                {t("yesLogout") || "Yes, Logout"}
              </button>
              <button className="cancel-logout-btnai" onClick={handleCancelLogout}>
                {t("cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="page-titleai">{ "Crop Recommendations"}</h2>

      {/* 🧩 Sensor Data Display */}
      <div className="sensor-dataai" style={{ background: darkMode ? '#2a2a2a' : '#e8f5e9', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>📊 Current Sensor Readings</h3>
        <p>🌡️ <strong>Temperature:</strong> {currentTemp} °C</p>
        <p>💧 <strong>Humidity:</strong> {currentHum} %</p>
        <p>🌿 <strong>Soil Moisture:</strong> {currentSoil} %</p>
      </div>

      {/* 🪴 Crop Recommendation Display */}
      {recommendedCrops.length > 0 ? (
        <>
          <div style={{ background: '#4caf50', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            <h3>✅ Found {recommendedCrops.length} Suitable Crop(s)</h3>
          </div>
          {recommendedCrops.map((crop, i) => renderCropCard(crop, i, true))}
        </>
      ) : (
        <>
          <div className="no-dataai" style={{ background: '#fff3cd', color: '#856404', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <h3>⚠️ No Crops Match Current Conditions</h3>
            <div style={{ marginTop: "15px", fontSize: "1em" }}>
              <p><strong>Current Sensor Values:</strong></p>
              <p>🌡️ Temperature: <strong>{currentTemp}°C</strong></p>
              <p>💧 Humidity: <strong>{currentHum}%</strong></p>
              <p>🌿 Soil Moisture: <strong>{currentSoil}%</strong></p>
            </div>
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={() => setShowAllCrops(!showAllCrops)}
                style={{ 
                  padding: '10px 20px', 
                  background: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontSize: '1em'
                }}
              >
                {showAllCrops ? '🔼 Hide All Crops' : '🔽 View All Available Crops'}
              </button>
            </div>
          </div>

          {showAllCrops && cropData.length > 0 && (
            <>
              <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>📋 All Available Crops in Database</h3>
              {cropData.map((crop, i) => renderCropCard(crop, i, false))}
            </>
          )}
        </>
      )}

      {/* Database Info */}
      {/* {cropData.length > 0 && (
        <div style={{ 
          marginTop: "30px", 
          padding: "15px", 
          background: darkMode ? '#2a2a2a' : '#f8f9fa', 
          borderRadius: "8px", 
          fontSize: "0.9em",
          borderLeft: '4px solid #007bff'
        }}>
          <strong>ℹ️ Database Status:</strong> Successfully loaded {cropData.length} crop(s) from Firebase
        </div>
      )} */}
    </div>
  );
};

export default AiRecommendation;