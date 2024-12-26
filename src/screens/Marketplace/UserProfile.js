import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, Image, Modal, TouchableWithoutFeedback } from "react-native";
import ForYou from "./MarketplaceLists/ForYou";
import { Ionicons } from "@expo/vector-icons";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    setDoc,
    updateDoc,
    addDoc,
    where,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import FullLoadingScreen from "../shared/FullLoadingScreen";
import ListingsList from '../../components/ListingsList'
import { ChatCircleDots, Check, DotsThree, EnvelopeSimple, Gear, InstagramLogo, Link, LinkedinLogo, Mailbox, Plus, QrCode, User, XLogo } from "phosphor-react-native";
import { colors } from "../../colors";
import { userContext } from "../../context/UserContext";
import ListingCard from "../../components/ListingCard";
import { getConversation } from '../../utils/firebaseUtils'
import { sendProfile } from "../../utils/socialUtils";
import * as Linking from 'expo-linking'
import ShareModal from "../../components/ShareModal";
import { useFocusEffect } from "@react-navigation/native";
import { ToastContext } from "../../context/ToastContext";

const UserProfile = ({ navigation, route, isOwnProfileInProfileStack = false }) => {
    const { userID } = route.params
    const { showToast } = useContext(ToastContext);
    const { user, userData, setUserData, userListings, userFollowingIds, setUserFollowingIds } = useContext(userContext)

    const [followingUser, setFollowingUser] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userProfile, setUserProfile] = useState(null) // avoid using "user" because we have a context for that
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [userPosts, setUserPosts] = useState([])
    const [shareModalVisible, setShareModalVisible] = useState(false)

    const [loadingIG, setLoadingIG] = useState(false)
    const [loadingLI, setLoadingLI] = useState(false)

    // temp here, clean this up later to only do it once
    const [profileLink, setProfileLink] = useState('');

    useEffect(() => {
        if (userID) {
            const link = Linking.createURL(`user/${userID}`);
            setProfileLink(link);
        }
    }, [userID]);

    const db = getFirestore();

    // OCM grab if its the users own post
    // imo a little more bulletproof than having 2 diff accounts
    useEffect(() => {
        if (user.uid === userID) {
            setIsOwnProfile(true)
            const sortedListings = userListings.sort((a, b) => {
                if (a.sold !== b.sold) {
                    return a.sold ? 1 : -1;
                }
                return b.createdAt - a.createdAt;

            });
            setUserPosts(sortedListings);
            setUserProfile(userData)
            setIsLoading(false);
        }
    }, [user, userData, userListings])


    // set navigation options and header based on what stack we are in
    useEffect(() => {
        if (isOwnProfileInProfileStack) {
            navigation.setOptions({
                // set options here, might not be needed anymore
            })
        } else {
            // is own profile 
            // is other user profile
            // regardless, no 3 dots, top header is just the back arrow
            // just want the back arrow
        }
    })


    // grab the profile from the backend by the userID
    useEffect(() => {
        const getProfile = async () => {
            try {
                const db = getFirestore();
                const userRef = doc(db, "users", userID);
                const userDoc = await getDoc(userRef);
                const queryListings = query(collection(db, "listings"),
                    where("userId", "==", userID)
                );
                const listingsDoc = await getDocs(queryListings)
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data())
                    const listingsData = listingsDoc.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    // sort by 1) sold or not sold, 2) time as tiebreaker
                    const sortedListings = listingsData.sort((a, b) => {
                        if (a.sold !== b.sold) {
                            return a.sold ? 1 : -1;
                        }
                        // convert to ms so that we can compare with subtraction
                        return b.createdAt.toMillis() - a.createdAt.toMillis();

                    });
                    setUserPosts(sortedListings);

                    // check if following user already
                    if (userFollowingIds && userFollowingIds.length !== 0) {
                        const followStatus = userFollowingIds.includes(userID);
                        if (followStatus) {
                            setFollowingUser(true)
                        } else {
                            setFollowingUser(false);
                        }
                    }
                    else {
                        setFollowingUser(false);
                    }
                }
                else {
                    console.error("No such user")
                }
            } catch (error) {
                console.error("Error fetching user and their listings:", error);
            } finally {
                setIsLoading(false);
            }
            // // setting the socials for testing
            // // TODO CHANGE TESTING (can we delete this)
            // setUserProfile(prevProfile => ({
            //     ...prevProfile,
            //     // instagram: 'williamhuntt',
            //     // linkedin: 'https://www.linkedin.com/in/william-hunt-7895a3212/'
            // }));
        };
        if (user.uid !== userID) {
            getProfile();
        }
    }, []);

    if (isLoading) {
        return <FullLoadingScreen />
    }

    if (!userProfile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'inter', fontWeight: '600', fontSize: 20 }}>
                    User not found!
                </Text>
                <Text style={{ fontFamily: 'inter', fontWeight: '400', fontSize: 14 }}>
                    This account may have been deleted
                </Text>
            </View>
        )
    }

    const handleFollow = () => {
        try {
            if (followingUser) {
                markAsUnfollowed();
            }
            else {
                markAsFollowed();
            }
            setFollowingUser(!followingUser)
        } catch (e) {
            console.error(e)
        }
    }

    // TODO: go through and make sure error checking is fine
    // TODO: see if it can be cleaner
    const markAsFollowed = async () => {
        // add other user to following
        const newFollowing = {
            following_id: userID,
            following_name: userProfile.name,
            following_pfp: userProfile.pfp,
            following_major: userProfile.major
        };
        // add curr user to their followers
        const newFollower = {
            follower_id: user.uid,
            follower_name: userData.name,
            follower_pfp: userData.pfp,
            follower_major: userProfile.major
        }
        const userRef = doc(db, "users", user.uid);
        const followingRef = doc(db, "users", userID)
        try {
            await updateDoc(userRef, {
                following: arrayUnion(newFollowing),
            })
            await updateDoc(followingRef, {
                followers: arrayUnion(newFollower),
            })
            const userDoc = await getDoc(userRef);
            setUserData(userDoc.data());

            const followingUserDoc = await getDoc(followingRef);
            setUserProfile(followingUserDoc.data())
        } catch (error) {
            console.error("Error following user", error);
        } finally {
            // frontend update
            setUserFollowingIds((prevUserFollowingIds) => [...prevUserFollowingIds, userID]);
        }
    }

    const markAsUnfollowed = async () => {
        const userRef = doc(db, "users", user.uid);
        const userToUnfollow = userData.following.find((item) => item.following_id === userID);

        const followingRef = doc(db, "users", userID);
        const userToRemove = userProfile.followers.find((item) => item.follower_id === user.uid);
        try {
            await updateDoc(userRef, {
                following: arrayRemove(userToUnfollow),
            });

            await updateDoc(followingRef, {
                followers: arrayRemove(userToRemove),
            })

            const userDoc = await getDoc(userRef);
            setUserData(userDoc.data());

            const followingUserDoc = await getDoc(followingRef);
            setUserProfile(followingUserDoc.data())
        } catch (error) {
            console.error("Error unfollowing error:", error);
        } finally {
            // frontend update
            setUserFollowingIds((prev) =>
                prev.filter((id) => id !== userID)
            );
        }
    }

    const handleMessage = async () => {
        // active user ID and the other user's ID
        const conversationID = await getConversation(user.uid, userID)
        const otherUserDetails = {
            id: userID,
            name: userProfile.name,
            pfp: userProfile.pfp
        }
        navigation.navigate('MessagesStack', {
            screen: 'Conversation',
            params: {
                conversationID: conversationID,
                otherUserDetails: otherUserDetails
            }
        });
    }

    // just navigation here
    const handleFollowers = () => {
        const followers = userData.followers
        navigation.navigate('Followers', {
            followers: followers,
            isFollowers: true,
        })
    }

    const handleFollowing = () => {
        const following = userData.following
        navigation.navigate('Followers', {
            following: following,
            isFollowers: false
        })
    }

    // todo maybe handle as error messages instead of alerts
    const openSocial = async (social) => {
        let url = ''
        switch (social) {
            case ('instagram'):
                if (!userProfile.instagram) {
                    setLoadingIG(true)
                    Alert.alert('Error', 'No Instagram user found')
                    return;
                }
                // works for now
                url = `https://www.instagram.com/${userProfile.instagram.split('@')[1]}`;
                break;
            case ('linkedin'):
                setLoadingLI(true)
                const isUrl = /^https?:\/\/.+$/.test(userProfile.linkedin);
                if (!isUrl) {
                    Alert.alert('Error', 'Invalid URL')
                    return;
                }
                if (!userProfile.linkedin) {
                    Alert.alert('Error', 'No LinkedIn user found')
                    return;
                }
                url = userProfile.linkedin
                break;
            default:
                Alert.alert('Error', 'Unsupported platform');
                return;
        }
        try {
            const supported = await Linking.canOpenURL(url)
            if (supported) {
                await Linking.openURL(url)
            } else {
                Alert.alert('Error', "Can't open Instagram profile")
            }
        } catch (e) {
            console.error("An error occurred while trying to open Instagram:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setLoadingIG(false)
            setLoadingLI(false)
        }
    }

    return (
        <View style={[styles.container]}>
            {/* , { marginTop: isOwnProfileInProfileStack ? 80 : 0 } */}

            {isOwnProfileInProfileStack && <View style={{ height: 80, width: '100%' }} />}
            <View style={styles.topContainer}>
                {userProfile.pfp ? (<Image
                    // pfp would go here
                    style={{ width: 60, height: 60, borderRadius: 75, backgroundColor: 'gray' }}
                    source={{ uri: userProfile?.pfp }}

                />) :
                    (<View style={{ backgroundColor: colors.loginGray, width: 60, height: 60, borderRadius: 75, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        <User size={24} />
                    </View>)
                }
                <View style={styles.headerTextContainer}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.nameText}
                    >
                        {userProfile?.name || "Anonymous"}
                    </Text>
                    <Text style={styles.netIDText}>
                        {userProfile?.email || "mystery@uw.edu"}
                    </Text>
                </View>

                {/* navigation to other  */}
                {isOwnProfileInProfileStack && (
                    <TouchableOpacity
                        style={{
                            position: 'absolute', right: 20,
                            top: 5
                        }}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {/* <Gear size={30} /> */}
                        <DotsThree size={30} weight="bold" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
                style={styles.scrollContainer}
            >
                <View style={{ paddingHorizontal: 25, display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[{ width: '100%', display: 'flex', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16, },]}>

                        {isOwnProfile ? (
                            <TouchableOpacity style={[styles.followButton, styles.shadow, { shadowColor: followingUser ? colors.neonBlue : colors.accentGray }]}
                                onPress={() => handleFollowers()}
                            >
                                <Text style={[styles.followText, { color: followingUser ? colors.neonBlue : colors.accentGray }]}>
                                    Followers
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.followButton, styles.shadow, { shadowColor: followingUser ? colors.neonBlue : colors.accentGray }]}
                                onPress={() => handleFollow()}
                            >

                                {followingUser ? <Check size={18} color={followingUser ? colors.neonBlue : colors.accentGray} /> : <Plus size={18} color={colors.accentGray} />}
                                <Text style={[styles.followText, { color: followingUser ? colors.neonBlue : colors.accentGray }]}>
                                    Follow{followingUser && 'ing'}
                                </Text>
                            </TouchableOpacity>)}

                        {isOwnProfile ? (<TouchableOpacity style={[styles.followButton, styles.shadow]}
                            onPress={() => handleFollowing()}
                        >
                            <Text style={[styles.followText, { backgroundColor: 'white' }]}>
                                Following
                            </Text>
                        </TouchableOpacity>) : (<TouchableOpacity style={[styles.followButton, styles.shadow]}
                            onPress={() => handleMessage()}
                        >
                            <EnvelopeSimple size={18} color={colors.accentGray} />
                            <Text style={[styles.followText, { backgroundColor: 'white' }]}>
                                Message
                            </Text>
                        </TouchableOpacity>)}
                    </View>

                    <View style={styles.bioContainer}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', }}>
                            <View >
                                <Text style={styles.majorText}>
                                    {userProfile.major}
                                </Text>
                                {userProfile?.concentration && (
                                    <Text style={{ fontFamily: 'inter', fontSize: 16, color: colors.accentGray, fontWeight: '500' }}>
                                        {userProfile.concentration}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.majorText}>
                                {userProfile.gradYear}
                            </Text>
                        </View>

                        {userProfile?.bio && (<View style={{ marginTop: 12, width: '100%', maxHeight: 128, marginBottom: 0 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                                {userProfile.bio}
                            </Text>
                        </View>)}
                        {(userProfile.instagram || userProfile.linkedin) && (<View style={[styles.socials, { height: userProfile.instagram && userProfile.linkedin ? 60 : 40 }]}>

                            {userProfile.instagram && <TouchableOpacity
                                style={styles.socialContainer}
                                onPress={() => openSocial('instagram')}
                            >
                                {loadingIG ? (<ActivityIndicator />) : (<Image
                                    source={require('../../../assets/images/IG_logo.png')}
                                    style={{ width: 25, height: 25, borderRadius: 5 }}
                                />)}
                                <Text style={styles.socialText}>
                                    {userProfile.instagram}
                                </Text>
                            </TouchableOpacity>}

                            {userProfile.linkedin && <TouchableOpacity
                                style={styles.socialContainer}
                                onPress={() => openSocial('linkedin')}
                            >
                                <Image
                                    source={require('../../../assets/images/LI_logo.png')}
                                    style={{ width: 25, height: 25, borderRadius: 5 }}
                                />
                                <Text numberOfLines={1}
                                    style={styles.socialText}>
                                    {userProfile.linkedin}
                                </Text>
                            </TouchableOpacity>}


                        </View>)}
                        <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600', alignSelf: 'flex-start', marginBottom: 0, marginTop: 20 }}>
                            Listings
                        </Text>
                        {/* {userPosts && userPosts.length > 0 && (
                            // <View>
                            <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600', alignSelf: 'flex-start', marginBottom: 0, marginTop: 20 }}>
                                Listings
                            </Text>
                            // </View>
                        )} */}
                    </View>
                </View>
                {userPosts && userPosts.length > 0 ? (userPosts.length === 1 ? (<View style={{ width: '50%', alignSelf: 'flex-start' }}>
                    <ListingCard listing={userPosts[0]} />
                </View>) : (<View style={{
                    width: '100%',
                }}>
                    <ListingsList listings={userPosts} navigation={navigation} scrollEnabled={false} />
                </View>)) : (
                    <View style={{ alignSelf: 'center' }}>
                        <Text style={{ fontFamily: 'inter', fontSize: 16, fontWeight: '400', marginLeft: 25 }}>
                            {isOwnProfile ? 'You have ' : 'User has '}no listings
                        </Text>
                        {isOwnProfile && <Text style={{ fontFamily: 'inter', fontSize: 16, fontWeight: '400', marginLeft: 25 }}
                        >
                            Make a post to get started!
                        </Text>}
                    </View>
                )}

            </ScrollView >

            {isOwnProfile && (
                <TouchableOpacity style={{ backgroundColor: 'white', borderColor: colors.darkblue, width: 60, height: 60, borderRadius: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', shadowColor: colors.neonBlue, shadowOpacity: 0.35, shadowRadius: 5, position: 'absolute', bottom: 15, right: 15, shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 } }}
                    onPress={() => {
                        setShareModalVisible(true)
                    }}
                >
                    <QrCode color={colors.darkblue} size={30} />
                </TouchableOpacity>
            )}

            <ShareModal isVisible={shareModalVisible} setShareModalVisible={setShareModalVisible} profileLink={profileLink} />
        </View >
    )

}

export default UserProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignSelf: 'center',
        paddingHorizontal: 1
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: 25
    },
    headerTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 12,
        marginBottom: 6,
        maxWidth: '70%',
        height: 60,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '600',
        fontFmaily: 'inter'
    },
    netIDText: {
        fontSize: 17,
        fontWeight: '400',
        color: colors.accentGray,
        fontFmaily: 'inter'
    },
    bioContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 12,
        width: '100%',
        marginTop: 4
    },
    socials: {
        flexDirection: 'column',
        marginTop: 16,
        width: '100%',
        justifyContent: 'space-between',
        // height: 60
    },
    followText: {
        marginLeft: 4,
        fontSize: 15,
        fontFamily: 'inter',
        color: colors.accentGray
    },
    followButton: {
        width: '45%',
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: 'white',
    },
    shadow: {
        shadowColor: colors.accentGray,
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 }
    },
    majorText: {
        fontFamily: 'inter',
        fontSize: 18,
        fontWeight: '600',
        color: colors.uwPurple
    },
    socialContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    socialText: {
        marginLeft: 8,
        fontSize: 17,
        fontFamily: 'inter',
        color: colors.loginBlue,
        maxWidth: '80%',
    },
})
