import { useState, useEffect, useContext } from 'react';
import { doc, getDoc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { deleteFromSavedPosts, deleteImages, getConversation } from '../utils/firebaseUtils';
import * as Linking from 'expo-linking';
import { db } from '../../firebaseConfig'
import { userContext } from '../context/UserContext';

export const useListing = (listingID) => {
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoadingSave, setIsLoadingSave] = useState(false);
    const [postSold, setPostSold] = useState(false);
    const [isOwnPost, setIsOwnPost] = useState(false);
    const [sellerID, setSellerID] = useState(null);
    const { user, savedPosts, setSavedPosts, setUserListings } = useContext(userContext);

    // get the listings data
    const fetchListing = async () => {
        setIsLoading(true);
        try {
            const docRef = doc(db, "listings", listingID);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.error("No such listing!");
                return;
            }

            const data = docSnap.data();
            setListing({ id: docSnap.id, ...data });

            // Set post ownership and status
            const isOwner = data.userId === user.uid;
            setIsOwnPost(isOwner);
            setSellerID(isOwner ? user.uid : data.userId);
            setPostSold(!!data.sold);

            // Check if post is saved
            const alreadySaved = savedPosts?.some(
                (post) => post.listing_id === listingID && post.userID === user.uid
            );
            setIsSaved(!!alreadySaved);

        } catch (error) {
            console.error("Error fetching listing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // save/unsave
    const handleSavePost = async () => {
        if (!listing) return;
        setIsLoadingSave(true);

        try {
            const listingRef = doc(db, 'savedPosts', user.uid + listingID);

            if (!isSaved) {
                await handleSaveNewPost(listingRef);
            } else {
                await handleUnsavePost(listingRef);
            }

            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Error handling save post:', error);
        } finally {
            setIsLoadingSave(false);
        }
    };

    const handleSaveNewPost = async (listingRef) => {
        const newSaved = {
            userID: user.uid,
            listing_id: listingID,
            price: listing.price,
            title: listing.title,
            photos: listing.photos
        };
        await setDoc(listingRef, newSaved);
        // setSavedPosts(prev => [...prev, newSaved]); // this was to put at the back 
        setSavedPosts(prev => [newSaved, ...prev]); // this is the front (hopefully)
    };

    const handleUnsavePost = async (listingRef) => {
        await deleteDoc(listingRef);
        setSavedPosts(prevSavedPosts =>
            prevSavedPosts.filter(
                (post) => !(post.listing_id === listingID && post.userID === user.uid)
            )
        );
    };

    const handleMarkAsSold = async () => {
        if (postSold) {
            await markAsActive();
        } else {
            await markAsSold();
        }
    };

    const markAsSold = async () => {
        const docRef = doc(db, "listings", listingID);
        const updatedData = { sold: true };
        try {
            await updateDoc(docRef, updatedData);
            updateListingState(true, updatedData);
        } catch (error) {
            console.error("Error marking listing as sold:", error);
        }
    };

    const markAsActive = async () => {
        const docRef = doc(db, "listings", listingID);
        const updatedData = { sold: false };
        try {
            await updateDoc(docRef, updatedData);
            updateListingState(false, updatedData);
        } catch (error) {
            console.error("Error marking listing as active:", error);
        }
    };

    const updateListingState = (newSoldState, updatedData) => {
        setPostSold(newSoldState);
        setUserListings(prevUserListings =>
            prevUserListings.map(listing =>
                listing.id === listingID ? { ...listing, ...updatedData } : listing
            )
        );
    };


    const handleDeleteListing = async () => {
        try {
            if (listing.photos?.length > 0) {
                await deleteImages(listing.photos);
            }

            await deleteFromSavedPosts(listingID);
            await deleteDoc(doc(db, "listings", listingID));

            setUserListings((prevUserListings) =>
                prevUserListings.filter((post) => post.id !== listingID)
            );
            //    HERE REFRESH LISTINGS
            return true;  // success
        } catch (error) {
            console.error("Error deleting listing:", error);
            return false; // failure
        }
    };


    const handleShareListing = () => {
        const deepLink = Linking.createURL(`listing/${listingID}`);
        const messageBody = `Check out this listing on Ripple!\n${deepLink}`;
        const smsURL = `sms:&body=${encodeURIComponent(messageBody)}`;

        try {
            Linking.openURL(smsURL);
            return true;
        } catch (error) {
            console.error('Error sharing listing:', error);
            return false; // failure
        }
    };


    const handleSendHi = async () => {
        if (!user.uid || !sellerID) return false;

        try {
            const conversationID = await getConversation(user.uid, sellerID);
            return {
                conversationID,
                otherUserDetails: {
                    id: sellerID,
                    name: listing.userName,
                    pfp: listing.userPfp
                }
            };
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    };

    return {
        listing,
        isLoading,
        isSaved,
        isLoadingSave,
        postSold,
        isOwnPost,
        sellerID,

        fetchListing,
        handleSavePost,
        handleMarkAsSold,
        handleDeleteListing,
        handleShareListing,
        handleSendHi,
    };
};