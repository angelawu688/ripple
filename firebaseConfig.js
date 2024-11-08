import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAhRpIdHKZk_H9Jkp-In9Pc0YgB01pnnQE",
    authDomain: "uw-marketplace-ebe58.firebaseapp.com",
    projectId: "uw-marketplace-ebe58",
    storageBucket: "uw-marketplace-ebe58.firebasestorage.app",
    messagingSenderId: "869271955900",
    appId: "1:869271955900:web:5e86631328a20eaf1f23b9",
    measurementId: "G-D0QTKLFW34"
  };

  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);