import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore"
import { db } from "../../firebaseConfig"

// userA blocks userB
// remove following/follower documents from userA and userB
export const blockUser = async (userA, userB) => {
    try {
        // grab user documents
        const userADocRef = doc(db, "users", userA);
        const userBDocRef = doc(db, "users", userB);
        const [userASnap, userBSnap] = await Promise.all([
            getDoc(userADocRef),
            getDoc(userBDocRef),
        ]);

        if (!userASnap.exists() || !userBSnap.exists()) {
            console.error('one or more user doesnt exist!')
            return;
        }

        const userAData = userASnap.data();
        const userBData = userBSnap.data();

        // update the following/followers objects
        const updatedUserBFollowers = userBData.followers.filter(f => f.follower_id !== userA);
        const updatedUserBFollowing = userBData.following.filter(f => f.following_id !== userA);
        const updatedUserAFollowers = userAData.followers.filter(f => f.follower_id !== userB);
        const updatedUserAFollowing = userAData.following.filter(f => f.following_id !== userB);

        await setDoc(doc(db, `users/${userA}/blocks/${userB}`), {
            blocked_user: userB,
            blockedAt: Date.now()
        });

        await updateDoc(userADocRef, {
            followers: updatedUserAFollowers,
            following: updatedUserAFollowing
        });

        await updateDoc(userBDocRef, {
            followers: updatedUserBFollowers,
            following: updatedUserBFollowing
        });

    } catch (e) {
        console.error('error blocking user', e)
        throw e
    }
}

export const unblockUser = async (currentUser, otherUser) => {
    try {
        await deleteDoc(doc(db, `users/${currentUser}/blocks/${otherUser}`));
    } catch (e) {
        console.error(e)
        throw e
    }
}


export const checkIfBlocked = async (otherUserID, currentUserID) => {
    try {
        const blockDoc = await getDoc(doc(db, `users/${otherUserID}/blocks/${currentUserID}`));
        return blockDoc.exists();
    } catch (e) {
        console.error(e)
    }

}