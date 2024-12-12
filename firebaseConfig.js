import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants'
// import API keys from Expo Config
const {
  APIKEY,
  AUTHDOMAIN,
  PROJECT_ID,
  STORAGEBUCKET,
  MESSAGINGSENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
} = Constants.expoConfig.extra;

const firebaseConfig = {
  apiKey: APIKEY,
  authDomain: AUTHDOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: MESSAGINGSENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID
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