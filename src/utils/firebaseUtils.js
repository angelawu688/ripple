import { storage } from "../../firebaseConfig"
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

// will delete an image from the DB
export const deleteImageFromDB = async (photoRef) => {
    const imageRef = ref(storage, photoRef);
    await deleteObject(imageRef); // deletes from storage
};
