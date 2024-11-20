import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const userContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            // grab user posts here
          } else {
            console.warn("No such document!");
            setUserData(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
      } else {
        setUserData(null); // Clear user data if no user is logged in
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <userContext.Provider value={{ user, setUser, savedPosts, setSavedPosts, userData, setUserData, isLoading }}>
      {children}
    </userContext.Provider>
  );
};