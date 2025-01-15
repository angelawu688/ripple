import { useState, useEffect, useContext } from 'react';
import {
    doc,
    getDoc,
    getFirestore,
    query,
    collection,
    where,
    getDocs,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { userContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { getConversation } from '../utils/firebaseUtils';
import { Easing } from 'react-native';
import { checkIfBlocked } from '../utils/blockUser';

export const useProfileData = (profileUserID) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [followingUser, setFollowingUser] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [hasBlocked, setHasBlocked] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const {
        user,
        userData,
        setUserData,
        userListings,
        userFollowingIds,
        setUserFollowingIds
    } = useContext(userContext);
    const navigation = useNavigation();

    const db = getFirestore();

    useEffect(() => {
        if (user.uid === profileUserID) {
            handleOwnProfileData();
        }
    }, [user, userData, userListings, profileUserID]);

    useEffect(() => {
        const checkBlockingStatus = async () => {
            if (!user?.uid || !profileUserID || user.uid === profileUserID) {
                setIsBlocked(false);
                setHasBlocked(false);
                return;
            }

            try {
                const [blocked, userHasBlocked] = await Promise.all([
                    checkIfBlocked(profileUserID, user.uid),
                    checkIfBlocked(user.uid, profileUserID)
                ]);
                setIsBlocked(blocked);
                setHasBlocked(userHasBlocked);
            } catch (error) {
                console.error('Block check error:', error);
            }
        };

        checkBlockingStatus();
    }, [user?.uid, profileUserID, refreshTrigger]);

    useEffect(() => {
        if (user.uid !== profileUserID) {
            fetchOtherUserProfile();
        }
    }, [profileUserID, refreshTrigger]);

    const handleOwnProfileData = () => {
        setIsOwnProfile(true);
        const sortedListings = userListings.sort((a, b) => {
            if (a.sold !== b.sold) {
                return a.sold ? 1 : -1;
            }
            return b.createdAt - a.createdAt;
        });
        setUserPosts(sortedListings);
        setUserProfile(userData);
        setIsLoading(false);
    };

    const refreshProfile = () => {
        setRefreshTrigger(prev => prev + 1)
    }

    const fetchOtherUserProfile = async () => {
        try {
            if (isBlocked || hasBlocked) {
                setUserProfile(null);
                setUserPosts([]);
                setIsLoading(false);
                return;
            }

            const userRef = doc(db, "users", profileUserID);
            const userDoc = await getDoc(userRef);

            const queryListings = query(
                collection(db, "listings"),
                where("userId", "==", profileUserID)
            );
            const listingsDoc = await getDocs(queryListings);

            if (userDoc.exists()) {
                setUserProfile(userDoc.data());

                const listingsData = listingsDoc.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const sortedListings = listingsData.sort((a, b) => {
                    if (a.sold !== b.sold) {
                        return a.sold ? 1 : -1;
                    }
                    return b.createdAt.toMillis() - a.createdAt.toMillis();
                });

                setUserPosts(sortedListings);

                if (userFollowingIds?.length) {
                    setFollowingUser(userFollowingIds.includes(profileUserID));
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        try {
            if (followingUser) {
                await markAsUnfollowed();
            } else {
                await markAsFollowed();
            }
            setFollowingUser(!followingUser);
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };

    const markAsFollowed = async () => {
        // add other user to following
        const newFollowing = {
            following_id: profileUserID,
            following_name: userProfile.name,
            following_pfp: userProfile.pfp,
            following_major: userProfile.major
        };

        // add curr user to their followers
        const newFollower = {
            follower_id: user.uid,
            follower_name: userData.name,
            follower_pfp: userData.pfp,
            follower_major: userData.major
        };

        const userRef = doc(db, "users", user.uid);
        const followingRef = doc(db, "users", profileUserID);

        try {
            await updateDoc(userRef, {
                following: arrayUnion(newFollowing),
            });
            await updateDoc(followingRef, {
                followers: arrayUnion(newFollower),
            });

            const [userDoc, followingUserDoc] = await Promise.all([
                getDoc(userRef),
                getDoc(followingRef)
            ]);

            // frontend update
            setUserData(userDoc.data());
            setUserProfile(followingUserDoc.data());
            setUserFollowingIds(prev => [...prev, profileUserID]);
        } catch (error) {
            console.error("Error following user:", error);
            throw error;
        }
    };

    const markAsUnfollowed = async () => {
        const userRef = doc(db, "users", user.uid);
        const userToUnfollow = userData.following.find(
            item => item.following_id === profileUserID
        );

        const followingRef = doc(db, "users", profileUserID);
        const userToRemove = userProfile.followers.find(
            item => item.follower_id === user.uid
        );

        try {
            await Promise.all([
                updateDoc(userRef, {
                    following: arrayRemove(userToUnfollow),
                }),
                updateDoc(followingRef, {
                    followers: arrayRemove(userToRemove),
                })
            ]);

            const [userDoc, followingUserDoc] = await Promise.all([
                getDoc(userRef),
                getDoc(followingRef)
            ]);

            setUserData(userDoc.data());
            setUserProfile(followingUserDoc.data());
            setUserFollowingIds(prev => prev.filter(id => id !== profileUserID));
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw error;
        }
    };

    const handleFollowers = () => {
        const followers = userData.followers
        navigation.navigate('Followers', {
            followers: followers,
            isFollowers: true,
        });
    };

    const handleFollowing = () => {
        const following = userData.following
        navigation.navigate('Followers', {
            following: following,
            isFollowers: false
        });
    };

    const handleMessage = async () => {
        // active user ID and the other user's ID
        const conversationID = await getConversation(user.uid, profileUserID)
        const otherUserDetails = {
            id: profileUserID,
            name: userProfile.name,
            pfp: userProfile.pfp
        }
        navigation.navigate('MessagesStack', {
            screen: 'Conversation',
            params: {
                conversationID: conversationID,
                otherUserDetails: otherUserDetails
            },
            // add an animation
            // idk how I feel about it
            animation: 'slide_from_right',
        });
    }

    return {
        isLoading,
        userProfile,
        userPosts,
        isOwnProfile,
        followingUser,
        isBlocked,
        hasBlocked,
        handleFollowToggle,
        handleFollowers,
        handleFollowing,
        handleMessage,
        refreshProfile
    };
};