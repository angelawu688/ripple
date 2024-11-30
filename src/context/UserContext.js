import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';


export const userContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null)



  const handleSignOut = async () => {
    const auth = getAuth()
    try {
      // sign out
      await signOut(auth);
      // clear async
      await clearAllData();
    } catch (e) {
      console.log('Sign out error: ', e)
      throw e
    }
  }

  const fetchUserData = async (firebaseUser) => {
    const db = getFirestore();
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      // grab saved posts
      const querySaved = query(collection(db, "savedPosts"), where("userID", "==", firebaseUser.uid));
      const querySavedSnapshot = await getDocs(querySaved);

      // grab user listings
      const queryPosts = query(collection(db, "listings"), where("userId", "==", firebaseUser.uid));
      const queryPostsSnapshot = await getDocs(queryPosts);

      // update our state
      if (userDoc.exists()) {
        const savedListings = querySavedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const listings = queryPostsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserData(userDoc.data());
        setSavedPosts(savedListings || []);
        setUserListings(listings || []);

        // store all in async storage
        await AsyncStorage.setItem('userData', JSON.stringify(userDoc.data()));
        await AsyncStorage.setItem('savedPosts', JSON.stringify(savedListings));
        await AsyncStorage.setItem('userListings', JSON.stringify(listings));
      } else {
        // do nothing
      }
    } catch (e) {
      setAuthError(e.message)
    }
  }

  // signs in the user
  // also fetches the user data
  const handleSignIn = async (email, password) => {
    console.log('called')
    try {
      setAuthError(null)
      // make sure we have uw email
      if (!email.endsWith('uw.edu')) {
        setAuthError('Log in with your @uw.edu email!')
        throw new Error('Log in with your @uw.edu email!')
      }
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await fetchUserData(userCredential.user)
      setUser(userCredential.user)
      return userCredential.user
    } catch (e) {
      const message = e.message === 'Log in with your @uw.edu email!' ? 'Log in with your @uw.edu email!' : 'Incorrect email or password!'
      setAuthError(message);
      throw e;
    }
  }

  const clearAllData = async () => {
    try {
      await AsyncStorage.clear() // clear everything from async

      // reset all of our state
      setUser(null);
      setUserData(null);
      setSavedPosts([]);
      setUserListings([]);
      setAuthError(null);
    } catch (e) {
      console.log('Error clearing states: ', e)
      throw e
    }
  }



  // initialize auth states from async storage
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        const storedSavedPosts = await AsyncStorage.getItem('savedPosts');
        const storedUserListings = await AsyncStorage.getItem('userListings');

        if (storedUserData) setUserData(JSON.parse(storedUserData));
        if (storedSavedPosts) setSavedPosts(JSON.parse(storedSavedPosts));
        if (storedUserListings) setUserListings(JSON.parse(storedUserListings));
      } catch (error) {
        console.error("Error loading stored auth state:", error);
        throw new Error(`Error loading stored auth state: ${error.message}`)
      }
    };

    initializeAuthState();
  }, []);

  // this listens for auth state changes
  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // firebaseUser
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          const querySaved = query(collection(db, "savedPosts"), where("userID", "==", firebaseUser.uid));
          const querySavedSnapshot = await getDocs(querySaved);
          const queryPosts = query(collection(db, "listings"), where("userId", "==", firebaseUser.uid));
          const queryPostsSnapshot = await getDocs(queryPosts);
          if (userDoc.exists()) {
            const savedListings = querySavedSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            const listings = queryPostsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserData(userDoc.data());
            setSavedPosts(savedListings || []);
            setUserListings(listings || []);
          } else {
            console.warn("No such document!");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        // CLEAR ASYNC STORAGE
        setUserData(null); // Clear user data if no user is logged in
        setSavedPosts(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <userContext.Provider value={{
      user,
      userData,
      savedPosts,
      userListings,
      isLoading,
      authError,
      handleSignIn,
      handleSignOut,
      setUser,
      setSavedPosts,
      setUserData,
      setUserListings,
    }}>
      {children}
    </userContext.Provider>
  );
};


