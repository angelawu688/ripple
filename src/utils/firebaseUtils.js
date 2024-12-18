import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig"
import { getDownloadURL, ref, uploadBytesResumable, refFromURL, deleteObject } from 'firebase/storage'
import { useContext } from "react";
import { userContext } from "../context/UserContext";



// uploads an image to the storage bucket associated with a user account
// could also use expo file system API but I think this makes enough sense
// the downloadURL that is returned here can be used in an image component
export const uploadPFP = async (uri, userID) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        // create ref and upload
        const storageRef = ref(storage, `profile-pictures/${userID}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        // return a promise that resolves with the download URL
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                (error) => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (e) {
        console.log(e)
        throw e
    }
}

// same thing as above
// will upload an image to the storage bucket, but it does it for 
export const uploadListingImage = async (uri, userID, listingID, index) => {
    try {
        // basically converts the uri to something that we can store in firebase
        const response = await fetch(uri)
        const blob = await response.blob()

        // create ref and upload
        const storageRef = ref(storage, `listing-pictures/${userID}/${listingID}-${index}-${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        // this will return the download URL
        // we do it as a promise because the upload isnt instant
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                (error) => reject(error),
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (e) {
        console.log(e)
        throw e
    }
}

// will download an image to the messageID that we want
export const uploadMessageImage = async (conversationId, imageUri, messageID) => {
    try {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `conversations/${conversationId}/${messageID}-${Date.now()}`);

        const response = await fetch(imageUri);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(storageRef, blob);

        const downloadURL = await new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                null,
                (error) => reject(error),
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
        return downloadURL
    } catch (e) {
        console.log(e)

        throw e
    }
}

// will delete an image from the DB
export const deleteImageFromDB = async (photoRef) => {
    const imageRef = ref(storage, photoRef);
    await deleteObject(imageRef); // deletes from storage
};



// MESSAGES
// ------------------
export const sendMessage = async (convID, senderID, textContent = undefined, postID = undefined, imageUri = undefined) => {
    if (!textContent.trim() && !postID && !imageUri) {
        // ensure that we have at least one field
        console.log('returned')
        return;
    }
    try {
        // nested collection.
        const messageRef = doc(collection(db, 'conversations', convID, 'messages'))

        // if we have an image, upload to the DB
        // if this fails, the message wont send
        let downloadURL = undefined
        if (imageUri) {
            try {
                downloadURL = await uploadMessageImage(convID, imageUri, messageRef.id)
            } catch (e) {
                console.log(e)
                throw e
            }
        }

        // create our new message in the DB
        await setDoc(messageRef, {
            sentBy: senderID,
            textContent: textContent ? textContent : '',
            postID: postID ? postID : '',
            imageUri: downloadURL ? downloadURL : '',
            timestamp: Date.now(),
        })

        // update the conversation data
        let lastMessage = ''

        if (textContent) {
            lastMessage = textContent
        } else if (postID) {
            lastMessage = 'Attachment: 1 post'
        } else if (imageUri) {
            lastMessage = 'Attachment: 1 image'
        } else {
            // this shouldnt happen
            lastMessage = 'Message'
        }

        const conversationRef = doc(db, 'conversations', convID)
        await updateDoc(conversationRef, {
            lastMessage: lastMessage,
            timestamp: Date.now(),
            lastMessageReadBy: senderID,
        })
    } catch (e) {
        console.log(e)
        throw e
    }
}

// this will get the conversation with another user
// if the conversation already exists, then we will just return the ID
export const getConversation = async (senderID, receiverID) => {
    console.log(senderID, receiverID)
    try {
        // this makes sure that the ID is unique and that everyone has their own ID
        // this helps with dealing with rewrites and stuff
        const convID = [senderID, receiverID].sort().join('-')
        const convRef = doc(db, 'conversations', convID)
        const convSnap = await getDoc(convRef)



        if (convSnap.exists()) {
            // already exists, just return
            return convID
        } else {
            // doesnt exist, make it
            // get both user's data
            const senderDoc = await getDoc(doc(db, 'users', senderID));
            const receiverDoc = await getDoc(doc(db, 'users', receiverID));
            const senderData = senderDoc.data();
            const receiverData = receiverDoc.data();

            // create new convo in db, with user details
            await setDoc(convRef, {
                users: [senderID, receiverID],
                userDetails: {
                    [senderID]: {
                        name: senderData.name || '',
                        pfp: senderData.pfp || ''
                    },
                    [receiverID]: {
                        name: receiverData.name || '',
                        pfp: receiverData.pfp || ''
                    }
                },
                lastMessage: '',
                timestamp: Date.now(),
                lastMessageReadBy: [senderID],
            });
            return convID
        }
    } catch (e) {
        console.log(e)
        throw e
    }
}


// GETTOR
export const getListingFromID = async (listingID) => {
    try {
        const docRef = doc(db, "listings", listingID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() }
        }
    } catch (e) {
        console.log(e)
        throw e
    }
}


// delete functions


// given an array of photo urls, deletes them all from the db
// regardless of collection/location
export const deleteImages = async (photos) => {
    const deletePromises = photos.map(async (photoURL) => {
        const url = new URL(photoURL);
        const fullPath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        const imageRef = ref(storage, fullPath);

        // handling errors if already deleted, ect,
        // logs for debugging
        try {
            await deleteObject(imageRef);
            console.log(`Successfully deleted: ${fullPath}`);
        } catch (deleteError) {
            if (deleteError.code === 'storage/object-not-found') {
                console.log(`File already deleted or not found: ${fullPath}`);
                return;
            }
            throw deleteError;
        }

    })
    await Promise.all(deletePromises)
}

// given a listingID, will delete all references to it in saved posts
export const deleteFromSavedPosts = async (listingID) => {
    const q = query(collection(db, 'savedPosts'), where('listing_id', '==', listingID))
    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    querySnapshot.forEach((docSnap) => {
        deletePromises.push(deleteDoc(docSnap.ref))
    })
    await Promise.all(deletePromises)
}

// UPDATE functions

// given a user id and profile image url, will update all listings with it
export const updateAllListingsPfp = async (userId, pfpLink) => {
    const q = query(collection(db, 'listings'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    querySnapshot.forEach((docSnap) => {
        updatePromises.push(updateDoc(docSnap.ref, { userPfp: pfpLink }))
    })
    await Promise.all(updatePromises)
}

// given a user id and new name, will update all listings with it
export const updateAllListingsName = async (userId, userName) => {
    const q = query(collection(db, 'listings'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    querySnapshot.forEach((docSnap) => {
        updatePromises.push(updateDoc(docSnap.ref, { userName: userName }))
    })
    await Promise.all(updatePromises)
}

// update saved posts with listing changes
export const updateAllSaved = async (listingID, listingTitle, listingPrice, photoURLs) => {
    const q = query(collection(db, 'savedPosts'), where('listing_id', '==', listingID))
    const querySnapshot = await getDocs(q);
    const updatePromises = [];
    querySnapshot.forEach((docSnap) => {
        updatePromises.push(updateDoc(docSnap.ref, { title: listingTitle, price: listingPrice, photos: photoURLs }))
    })
    await Promise.all(updatePromises)
}

// deletes the users account and references to it
export const deleteAccount = async (userID) => {
    const { user, setUser } = useContext(userContext)

    // delete all images from storage
    // delete all saved posts
    // delete all messages ? 
    // delete the actual user profile document

    // basically like they dissapeared without a trace
    console.log('account (not) deleted')
    setUser(null)
}