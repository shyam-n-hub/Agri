import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // General UI
      title: "Smart Agriculture Dashboard",
      welcome: "Welcome, Farmer!",
      navTitle: "AgriNav",
      dashboard: "Dashboard",
      reports: "Reports",
      ai: "AI",
      leafDetector: "Leaf Detector",
      darkMode: "🌙 Dark Mode",
      lightMode: "🌞 Light Mode",
      
      // Sensor Data
      sensorData: "Sensor Readings",
      temperature: "Temperature",
      humidity: "Humidity",
      soilMoisture: "Soil Moisture",
      sensorDataChart: "Sensor Data Over Time",
      last2Minutes: "Last 2 Minutes",
      
      // Notifications and Warnings
      temperatureHighWarning: "⚠️ Temperature is too high! Consider irrigation or shade.",
      soilDryWarning: "⚠️ Soil is too dry! Please water the crops.",
      
      // Recommendations
      cropAdvice: "AI Crop Recommendations",
      cropRecommendations: "Recommended Crops",
      fertilizer: "Fertilizer Guidance",
      irrigation: "Irrigation Advice",
      suitabilityScore: "Suitability Score",
      recommendationNote: "These crops are recommended based on current environmental conditions.",
      noCropRecommendation: "No crop recommendation available.",
      noCropRecommendationEntry: "No crop recommendation available for this entry.",
      
      // AI Recommendation specific
      time: "Time",
      avgTemperature: "Avg Temperature",
      avgHumidity: "Avg Humidity", 
      avgSoilMoisture: "Avg Soil Moisture",
      crop: "Crop",
      temperatureRange: "Temperature Range",
      humidityRange: "Humidity Range",
      soilMoistureRange: "Soil Moisture Range",
      waterNeeds: "Water Needs",
      yieldPeriod: "Yield Period",
      costEstimate: "Cost Estimate",
      fertilizers: "Fertilizers",
      
      // Common crop names
      crops: {
        rice: "Rice",
        wheat: "Wheat",
        cotton: "Cotton",
        sugarcane: "Sugarcane",
        maize: "Maize"
      },
      
      // Water needs categories
      waterNeeds: {
        high: "High",
        medium: "Medium",
        low: "Low"
      },
      
      // Common fertilizers
      fertilizers: {
        urea: "Urea",
        npk: "NPK",
        dap: "DAP",
        potash: "Potash"
      },
      
      // Leaf Disease Detector
      leafDisease: "Leaf Disease Detector",
      selectImage: "Select Image",
      predict: "Predict",
      prediction: "Prediction",
      reason: "Reason",
      solution: "Solution",
      selectImageError: "Please select an image first.",
      predictionFailed: "Prediction failed.",
      predictionError: "Failed to get prediction. Please try again."
    },
  },
  ta: {
    translation: {
      // General UI
      title: "ஸ்மார்ட் வேளாண்மை டாஷ்போர்டு",
      welcome: "வணக்கம், விவசாயி!",
      navTitle: "அக்ரிநாவ்",
      dashboard: "டாஷ்போர்டு",
      reports: "அறிக்கைகள்",
      ai: "செயற்கை நுண்ணறிவு",
      leafDetector: "இலை நோய் கண்டறிதல்",
      darkMode: "🌙 இருள் பயன்முறை",
      lightMode: "🌞 ஒளி பயன்முறை",
      
      // Sensor Data
      sensorData: "சென்சார் வாசிப்புகள்",
      temperature: "வெப்பநிலை",
      humidity: "ஈரப்பதம்",
      soilMoisture: "மண் ஈரப்பதம்",
      sensorDataChart: "நேரப்போக்கில் சென்சார் தரவு",
      last2Minutes: "கடந்த 2 நிமிடங்கள்",
      
      // Notifications and Warnings
      temperatureHighWarning: "⚠️ வெப்பநிலை மிக அதிகமாக உள்ளது! நீர்ப்பாசனம் அல்லது நிழல் பரிந்துரைக்கப்படுகிறது.",
      soilDryWarning: "⚠️ மண் மிகவும் வறண்டுள்ளது! பயிர்களுக்கு தண்ணீர் பாய்ச்சவும்.",
      
      // Recommendations
      cropAdvice: "செயற்கை நுண்ணறிவு பயிர் பரிந்துரைகள்",
      cropRecommendations: "பரிந்துரைக்கப்பட்ட பயிர்கள்",
      fertilizer: "உரம் வழிகாட்டுதல்",
      irrigation: "பாசனை ஆலோசனை",
      suitabilityScore: "பொருத்த மதிப்பெண்",
      recommendationNote: "தற்போதைய சுற்றுச்சூழல் நிலைமைகளின் அடிப்படையில் இந்த பயிர்கள் பரிந்துரைக்கப்படுகின்றன.",
      noCropRecommendation: "பயிர் பரிந்துரை எதுவும் இல்லை.",
      noCropRecommendationEntry: "இந்த பதிவிற்கு பயிர் பரிந்துரை எதுவும் இல்லை.",
      
      // AI Recommendation specific
      time: "நேரம்",
      avgTemperature: "சராசரி வெப்பநிலை",
      avgHumidity: "சராசரி ஈரப்பதம்", 
      avgSoilMoisture: "சராசரி மண் ஈரப்பதம்",
      crop: "பயிர்",
      temperatureRange: "வெப்பநிலை வரம்பு",
      humidityRange: "ஈரப்பத வரம்பு",
      soilMoistureRange: "மண் ஈரப்பத வரம்பு",
      waterNeeds: "நீர் தேவைகள்",
      yieldPeriod: "விளைச்சல் காலம்",
      costEstimate: "செலவு மதிப்பீடு",
      fertilizers: "உரங்கள்",
      
      // Common crop names
      crops: {
        rice: "நெல்",
        wheat: "கோதுமை",
        cotton: "பருத்தி",
        sugarcane: "கரும்பு",
        maize: "மக்காச்சோளம்"
      },
      
      // Water needs categories
      waterNeeds: {
        high: "அதிகம்",
        medium: "நடுத்தரம்",
        low: "குறைவு"
      },
      
      // Common fertilizers
      fertilizers: {
        urea: "யூரியா",
        npk: "என்பிகே",
        dap: "டிஏபி",
        potash: "பொட்டாஷ்"
      },
      
      // Leaf Disease Detector
      leafDisease: "இலை நோய் கண்டறிதல்",
      selectImage: "படத்தைத் தேர்ந்தெடுக்கவும்",
      predict: "கணிக்கவும்",
      prediction: "கணிப்பு",
      reason: "காரணம்",
      solution: "தீர்வு",
      selectImageError: "முதலில் ஒரு படத்தைத் தேர்ந்தெடுக்கவும்.",
      predictionFailed: "கணிப்பு தோல்வியடைந்தது.",
      predictionError: "கணிப்பைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
    },
  },
  hi: {
    translation: {
      // General UI
      title: "स्मार्ट कृषि डैशबोर्ड",
      welcome: "नमस्ते, किसान!",
      navTitle: "एग्रीनेव",
      dashboard: "डैशबोर्ड",
      reports: "रिपोर्ट",
      ai: "कृत्रिम बुद्धिमत्ता",
      leafDetector: "पत्ती रोग डिटेक्टर",
      darkMode: "🌙 डार्क मोड",
      lightMode: "🌞 लाइट मोड",
      
      // Sensor Data
      sensorData: "सेंसर रीडिंग",
      temperature: "तापमान",
      humidity: "आर्द्रता",
      soilMoisture: "मिट्टी की नमी",
      sensorDataChart: "समय के साथ सेंसर डेटा",
      last2Minutes: "पिछले 2 मिनट",
      
      // Notifications and Warnings
      temperatureHighWarning: "⚠️ तापमान बहुत अधिक है! सिंचाई या छाया पर विचार करें।",
      soilDryWarning: "⚠️ मिट्टी बहुत सूखी है! कृपया फसलों को पानी दें।",
      
      // Recommendations
      cropAdvice: "कृत्रिम बुद्धिमत्ता फसल अनुशंसाएँ",
      cropRecommendations: "अनुशंसित फसलें",
      fertilizer: "उर्वरक मार्गदर्शन",
      irrigation: "सिंचाई सलाह",
      suitabilityScore: "उपयुक्तता स्कोर",
      recommendationNote: "वर्तमान पर्यावरणीय परिस्थितियों के आधार पर इन फसलों की सिफारिश की जाती है।",
      noCropRecommendation: "कोई फसल अनुशंसा उपलब्ध नहीं है।",
      noCropRecommendationEntry: "इस प्रविष्टि के लिए कोई फसल अनुशंसा उपलब्ध नहीं है।",
      
      // AI Recommendation specific
      time: "समय",
      avgTemperature: "औसत तापमान",
      avgHumidity: "औसत आर्द्रता", 
      avgSoilMoisture: "औसत मिट्टी की नमी",
      crop: "फसल",
      temperatureRange: "तापमान सीमा",
      humidityRange: "आर्द्रता सीमा",
      soilMoistureRange: "मिट्टी की नमी सीमा",
      waterNeeds: "पानी की जरूरतें",
      yieldPeriod: "उपज अवधि",
      costEstimate: "लागत अनुमान",
      fertilizers: "उर्वरक",
      
      // Common crop names
      crops: {
        rice: "चावल",
        wheat: "गेहूँ",
        cotton: "कपास",
        sugarcane: "गन्ना",
        maize: "मक्का"
      },
      
      // Water needs categories
      waterNeeds: {
        high: "अधिक",
        medium: "मध्यम",
        low: "कम"
      },
      
      // Common fertilizers
      fertilizers: {
        urea: "यूरिया",
        npk: "एनपीके",
        dap: "डीएपी",
        potash: "पोटाश"
      },
      
      // Leaf Disease Detector
      leafDisease: "पत्ती रोग डिटेक्टर",
      selectImage: "छवि चुनें",
      predict: "भविष्यवाणी करें",
      prediction: "भविष्यवाणी",
      reason: "कारण",
      solution: "समाधान",
      selectImageError: "कृपया पहले एक छवि चुनें।",
      predictionFailed: "भविष्यवाणी विफल रही।",
      predictionError: "भविष्यवाणी प्राप्त करने में विफल। कृपया पुन: प्रयास करें।"
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;