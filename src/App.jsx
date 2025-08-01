import React, { useState } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import Dashboard from "./Dashboard"; 
import Report from './Report'; 
import AiRecommendation from "./AiRecommendation"; 
import LeafDetector from './LeafDetector'; 
import Login from "./Login"; 
import Signup from "./Signup"; // Import the Signup component
import './i18n'; // Import the translation config file  

function App() {   
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');    
  
  const handleLogin = () => {     
    setIsLoggedIn(true);   
  };    
  
  const handleSignup = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {     
    setIsLoggedIn(false);   
  };    
  
  return (     
    <Router>       
      <Routes>         
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />         
        <Route path="/signup" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Signup onSignup={handleSignup} />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />         
        <Route path="/report" element={isLoggedIn ? <Report /> : <Navigate to="/login" />} />         
        <Route path="/airecommendation" element={isLoggedIn ? <AiRecommendation /> : <Navigate to="/login" />} />         
        <Route path="/leaf-detector" element={isLoggedIn ? <LeafDetector /> : <Navigate to="/login" />} />         
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />       
      </Routes>     
    </Router>   
  ); 
}  

export default App;