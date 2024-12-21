import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { userContext } from './UserContext';
import { db } from '../../firebaseConfig';

export const UnreadContext = createContext();

export const UnreadProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useContext(userContext);

    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, "conversations"),
            where("users", "array-contains", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const totalUnread = snapshot.docs.reduce((count, doc) => {
                const data = doc.data();
                // if the last message was send by the user and hasnt been read
                if (data.lastMessageBy !== user.uid && data.lastMessageReadBy !== user.uid) {
                    return count + 1;
                }
                return count;
            }, 0);

            setUnreadCount(totalUnread);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    return (
        <UnreadContext.Provider value={{ unreadCount }}>
            {children}
        </UnreadContext.Provider>
    );
};