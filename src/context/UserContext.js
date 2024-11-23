import React, { createContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {getFirestore, doc, getDoc, query, collection, where, getDocs} from "firebase/firestore";

export const userContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [savedPosts, setSavedPosts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          const querySaved = query(collection(db, "savedPosts"), where("user_id", "==", firebaseUser.uid));
          const querySnapshot = await getDocs(querySaved);
          if (userDoc.exists()) {
            const savedListings = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setUserData(userDoc.data());
            setSavedPosts(savedListings);
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
        setSavedPosts(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <userContext.Provider value={{ user, setUser, userData, setUserData, isLoading, savedPosts, setSavedPosts }}>
      {children}
    </userContext.Provider>
  );
};