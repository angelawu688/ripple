import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { REACT_APP_APIKEY, REACT_APP_AUTHDOMAIN, REACT_APP_PROJECT_ID, REACT_APP_STORAGEBUCKET, REACT_APP_MESSAGINGSENDER_ID, REACT_APP_APP_ID, REACT_APP_MEASUREMENT_ID } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: REACT_APP_APIKEY,
  authDomain: REACT_APP_AUTHDOMAIN,
  projectId: REACT_APP_PROJECT_ID,
  storageBucket: REACT_APP_STORAGEBUCKET,
  messagingSenderId: REACT_APP_MESSAGINGSENDER_ID,
  appId: REACT_APP_APP_ID,
  measurementId: REACT_APP_MEASUREMENT_ID
};

// this avoids a weird error of initiliazing multiple apps
// Initialize Firebase app
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
// const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// this allows us to have persistence over sessions
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
// export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app)