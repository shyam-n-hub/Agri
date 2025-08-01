// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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
const database = getDatabase(app);

export default database;
