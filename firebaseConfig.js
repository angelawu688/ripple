import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { REACT_APP_APIKEY, REACT_APP_AUTHDOMAIN, REACT_APP_PROJECT_ID, REACT_APP_STORAGEBUCKET, REACT_APP_MESSAGINGSENDER_ID, REACT_APP_APP_ID, REACT_APP_MEASUREMENT_ID } from '@env';
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: REACT_APP_APIKEY,
  authDomain: REACT_APP_AUTHDOMAIN,
  projectId: REACT_APP_PROJECT_ID,
  storageBucket: REACT_APP_STORAGEBUCKET,
  messagingSenderId: REACT_APP_MESSAGINGSENDER_ID,
  appId: REACT_APP_APP_ID,
  measurementId: REACT_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);