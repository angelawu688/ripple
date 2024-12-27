import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, deleteDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebaseConfig"
import { getDownloadURL, ref, uploadBytesResumable, refFromURL, deleteObject } from 'firebase/storage'
import { useContext } from "react";
import { userContext } from "../context/UserContext";
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { signOut } from "firebase/auth";




// uploads an image to the storage bucket associated with a user account
// could also use expo file system API but I think this makes enough sense
// the downloadURL that is returned here can be used in an image component
export const uploadPFP = async (uri, userID) => {
    try {
        // processing to just be around 500 wide instead of huge. Probably dont need a thumbnail
        const processed = await compressImage(uri, 500, 0.8)

        const response = await fetch(processed);
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
        console.error(e)
        throw e
    }
}

// same thing as above
// will upload an image to the storage bucket, but it does it for the 3 images
export const uploadListingImage = async (uri, userID, listingID, index) => {
    try {
        // process all 3 of the images
        const processedImages = await processImage(uri);

        // uploiad all of them to firebase
        const uploadPromises = Object.entries(processedImages).map(async ([size, imageUri]) => {
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // put the size in the storage path
            const storageRef = ref(
                storage,
                `listing-pictures/${userID}/${listingID}-${index}-${size}-${Date.now()}`
            );

            const uploadTask = uploadBytesResumable(storageRef, blob);

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => reject(error),
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({ [size]: downloadURL });
                    }
                );
            });
        });

        // await all the uploads
        const results = await Promise.all(uploadPromises);

        // combine all back into one object
        const imageUrls = {};
        results.forEach(result => Object.assign(imageUrls, result));
        return imageUrls;

    } catch (e) {
        console.error(e)
        throw e
    }
}

// will download an image to the messageID that we want
export const uploadMessageImage = async (conversationId, imageUri, messageID) => {
    try {

        // 
        const processed = await compressImage(imageUri, 1000, 0.8)

        // Upload image to Firebase Storage
        const storageRef = ref(storage, `conversations/${conversationId}/${messageID}-${Date.now()}`);

        const response = await fetch(processed);
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
        console.error(e)
        throw e
    }
}

// will delete an image from the DB
export const deleteImageFromDB = async (photoRef) => {
    try {
        const imageRef = ref(storage, photoRef);
        await deleteObject(imageRef); // deletes from storage
    } catch (e) {
        // console.error(e)
        // throw e
        // failed, but its fine
    }

};



// MESSAGES
// ------------------
export const sendMessage = async (convID, senderID, textContent = undefined, postID = undefined, imageUri = undefined) => {
    // if(!convID) {
    //     convID = await createConversation([se])
    // }
    if (!textContent.trim() && !postID && !imageUri) {
        // ensure that we have at least one field
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
                console.error(e)
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
            lastMessage = '📦 Shared a listing'
        } else if (imageUri) {
            lastMessage = '📸 Shared a photo'
        } else {
            // this shouldnt happen
            lastMessage = 'Message'
        }

        const conversationRef = doc(db, 'conversations', convID)
        await updateDoc(conversationRef, {
            lastMessage: lastMessage,
            timestamp: Date.now(),
            // track who sent and read the last message
            lastMessageBy: senderID,
            lastMessageReadBy: senderID
        })
    } catch (e) {
        console.error(e)
        throw e
    }
}

// this will get the conversation with another user
// if the conversation already exists, then we will just return the ID
export const getConversation = async (senderID, receiverID) => {
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
        console.error(e)
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
        console.error(e)
        throw e
    }
}

// creates a conversation collection
export const createConversation = async (users) => {
    try {
        const conversationRef = await addDoc(collection(db, 'conversations'), {
            users,
            // Optionally, set default fields if you want them right away
            lastMessage: '',
            timestamp: Date.now(),
            userDetails: {},
        });

        // Return the newly created conversation ID
        return conversationRef.id;
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};


// delete functions


// given an array of photo urls, deletes them all from the db
// regardless of collection/location
export const deleteImages = async (photos) => {
    try {
        const deletePromises = photos.map(async (photoURL) => {
            const url = new URL(photoURL);
            const fullPath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            const imageRef = ref(storage, fullPath);

            // handling errors if already deleted, ect,
            // logs for debugging
            try {
                await deleteObject(imageRef);
            } catch (deleteError) {
                if (deleteError.code === 'storage/object-not-found') {
                    return;
                }
                throw deleteError;
            }

        })
        await Promise.all(deletePromises)
    } catch (e) {
        console.error(e)
        throw e
    }
}

// given a listingID, will delete all references to it in saved posts
export const deleteFromSavedPosts = async (listingID) => {
    try {
        const q = query(collection(db, 'savedPosts'), where('listing_id', '==', listingID))
        const querySnapshot = await getDocs(q);
        const deletePromises = [];
        querySnapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(docSnap.ref))
        })
        await Promise.all(deletePromises)
    } catch (e) {
        console.error(e)
        throw e
    }
}

// UPDATE functions

// given a user id and profile image url, will update all listings with it
export const updateAllListingsPfp = async (userId, pfpLink) => {
    try {
        const q = query(collection(db, 'listings'), where('userId', '==', userId))
        const querySnapshot = await getDocs(q);
        const updatePromises = [];
        querySnapshot.forEach((docSnap) => {
            updatePromises.push(updateDoc(docSnap.ref, { userPfp: pfpLink }))
        })
        await Promise.all(updatePromises)
    } catch (e) {
        console.error(e)
        throw e
    }

}

// given a user id and new name, will update all listings with it
export const updateAllListingsName = async (userId, userName) => {
    try {
        const q = query(collection(db, 'listings'), where('userId', '==', userId))
        const querySnapshot = await getDocs(q);
        const updatePromises = [];
        querySnapshot.forEach((docSnap) => {
            updatePromises.push(updateDoc(docSnap.ref, { userName: userName }))
        })
        await Promise.all(updatePromises)
    } catch (e) {
        console.error(e)
        throw e
    }
}

// given a user id and profile image url, will update all followers and following with it
export const updateAllFollowPfp = async (userId, pfpLinkNew, pfpLinkOld, userName) => {
    try {
        const followersQuery = query(collection(db, 'users'),
            where('followers', 'array-contains', { follower_id: userId, follower_name: userName, follower_pfp: pfpLinkOld }))
        const followersQuerySnapshot = await getDocs(followersQuery);
        const updatePromises = [];
        followersQuerySnapshot.forEach((docSnap) => {
            const followers = docSnap.data().followers;
            const updatedFollowers = followers.map((followerUser) => {
                if (followerUser.follower_id === userId) {
                    return { ...followerUser, follower_pfp: pfpLinkNew };
                }
                return followerUser
            });
            updatePromises.push(updateDoc(docSnap.ref, { followers: updatedFollowers }))
        })

        const followingQuery = query(collection(db, 'users'),
            where('following', 'array-contains', { following_id: userId, following_name: userName, following_pfp: pfpLinkOld }))
        const followingQuerySnapshot = await getDocs(followingQuery);
        followingQuerySnapshot.forEach((docSnap) => {
            const following = docSnap.data().following;
            const updatedFollowing = following.map((followingUser) => {
                if (followingUser.following_id === userId) {
                    return { ...followingUser, following_pfp: pfpLinkNew };
                }
                return followingUser
            });
            updatePromises.push(updateDoc(docSnap.ref, { following: updatedFollowing }))
        })
        await Promise.all(updatePromises)
    } catch (e) {
        console.error(e)
        throw e
    }
}

// given a user id and profile image url, will update all followers and following with it
export const updateAllFollowName = async (userId, userNameNew, userNameOld, userPfp) => {
    try {
        const followersQuery = query(collection(db, 'users'),
            where('followers', 'array-contains', { follower_id: userId, follower_name: userNameOld, follower_pfp: userPfp }))
        const followersQuerySnapshot = await getDocs(followersQuery);
        const updatePromises = [];
        followersQuerySnapshot.forEach((docSnap) => {
            const followers = docSnap.data().followers;
            const updatedFollowers = followers.map((followerUser) => {
                if (followerUser.follower_id === userId) {
                    return { ...followerUser, follower_name: userNameNew };
                }
                return followerUser
            });
            updatePromises.push(updateDoc(docSnap.ref, { followers: updatedFollowers }))
        })

        const followingQuery = query(collection(db, 'users'),
            where('following', 'array-contains', { following_id: userId, following_name: userNameOld, following_pfp: userPfp }))
        const followingQuerySnapshot = await getDocs(followingQuery);
        followingQuerySnapshot.forEach((docSnap) => {
            const following = docSnap.data().following;
            const updatedFollowing = following.map((followingUser) => {
                if (followingUser.following_id === userId) {
                    return { ...followingUser, following_name: userNameNew };
                }
                return followingUser
            });
            updatePromises.push(updateDoc(docSnap.ref, { following: updatedFollowing }))
        })
        await Promise.all(updatePromises)
    } catch (e) {
        console.error(e)
        throw e
    }
}

// update saved posts with listing changes
export const updateAllSaved = async (listingID, listingTitle, listingPrice, photoURLs) => {
    try {
        const q = query(collection(db, 'savedPosts'), where('listing_id', '==', listingID))
        const querySnapshot = await getDocs(q);
        const updatePromises = [];
        querySnapshot.forEach((docSnap) => {
            updatePromises.push(updateDoc(docSnap.ref, { title: listingTitle, price: listingPrice, photos: photoURLs }))
        })
        await Promise.all(updatePromises)
    } catch (e) {
        console.error(e)
        throw e
    }
}

// deletes the users account and references to it
export const deleteAccount = async (userID, setUser) => {
    try {
        // delete the user document (triggers cloud function to delete the rest)
        // Reference to the user's document
        const userRef = doc(db, "users", userID);

        // Delete the user's document
        await deleteDoc(userRef);

        // Sign out the user
        await signOut(auth);

        // loccl state
        setUser(null);
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
}


export const compressImage = async (uri, width = 500, quality = 0.8) => {
    try {
        const manipResult = await manipulateAsync(
            uri,
            [{ resize: { width: width } }],
            { compress: quality, format: SaveFormat.JPEG }
        );
        return manipResult.uri;
    } catch (e) {
        console.error(e)
        throw e
    }
}


export const processImage = async (uri) => {
    try {
        const thumbnail = await compressImage(uri, 50, 0.5)
        const card = await compressImage(uri, 500, 0.8)
        const full = await compressImage(uri, 1000, 0.8)
        return {
            thumbnail,
            card,
            full
        };
    } catch (e) {
        console.error(e)
        throw e
    }

}