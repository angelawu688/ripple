import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebaseConfig"
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage'



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