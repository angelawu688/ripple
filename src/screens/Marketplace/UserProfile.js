import { useContext, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView, Image } from "react-native";
import ForYou from "./MarketplaceLists/ForYou";
import { Ionicons } from "@expo/vector-icons";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import FullLoadingScreen from "../shared/FullLoadingScreen";
import ListingsList from '../../components/ListingsList'
import { Check, EnvelopeSimple, Gear, InstagramLogo, LinkedinLogo, Mailbox, Plus, User, XLogo } from "phosphor-react-native";
import { colors } from "../../colors";
import { userContext } from "../../context/UserContext";

const testUserPosts = [
    { id: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    { id: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
    { id: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
    { id: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: true },
    { id: 5, img: undefined, title: 'Catan Set', price: 10, sold: true },
]
const UserProfile = ({ navigation, route }) => {
    const { userID } = route.params
    const { user } = useContext(userContext)
    const [followingUser, setFollowingUser] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userProfile, setUserProfile] = useState(null) // avoid using "user" because we have a context for that
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [userListings, setUserListings] = useState([])

    const [loadingIG, setLoadingIG] = useState(false)
    const [loadingLI, setLoadingLI] = useState(false)

    // OCM grab if its the users own post
    // imo a little more bulletproof than having 2 diff accounts
    useEffect(() => {
        if (user.uid === userID) {
            setIsOwnProfile(true)
        }
    }, [user])

    useEffect(() => {
        if (isOwnProfile) {
            navigation.setOptions(
                {
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <Gear />
                        </TouchableOpacity>
                    )
                }
            )
        }
    }, [isOwnProfile])

    // Below is for testing
    // const [testUser, setTestUser] = useState({
    //     pfp: undefined,
    //     name: 'Alex Smith',
    //     netID: 'asmith@uw.edu',
    //     major: 'info',
    //     concentration: 'hci',
    //     gradYear: '2025',
    //     instagram: 'alex.smith',
    //     linkedin: 'SOME URL HERE',
    //     bio: "Jonah Coleman's favorite arist is EBK Yeebo. You should check him out",
    //     posts: testUserPosts
    // })
    //

    // grab the profile from the backend by the userID
    useEffect(() => {
        const getProfile = async () => {
            console.log('userID', userID)
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
                    setUserListings(listingsData);
                }
                else {
                    console.error("No such user")
                }
            } catch (error) {
                console.error("Error fetching user and their listings:", error);
            } finally {
                setIsLoading(false);
            }
            // setting the socials for testing
            // TODO CHANGE TESTING
            setUserProfile(prevProfile => ({
                ...prevProfile,
                // instagram: 'williamhuntt',
                // linkedin: 'https://www.linkedin.com/in/william-hunt-7895a3212/'
            }));
        };
        getProfile();
    }, []);



    if (isLoading) {
        return <FullLoadingScreen />
    }

    if (!userProfile) {
        return (
            <View>
                <Text>
                    User not found!
                </Text>
            </View>
        )
    }

    const handleFollow = () => {
        setFollowingUser(!followingUser)
        // BACKEND CHANGES HERE
    }

    const handleMessage = () => {
        console.log('gonna implement soon')
        // TODO 
        navigation.navigate('Conversation', { conversationID: 4 })
    }

    // todo maybe handle as error messages instead of alerts
    const openSocial = async (social) => {

        let url = ''
        switch (social) {
            case ('instagram'):
                if (!userProfile.instagram) {
                    setLoadingIG(true)
                    Alert.alert('Error', 'No Instagram user found')
                    console.log(userProfile.instagram)
                    return;
                }
                url = `https://www.instagram.com/${userProfile.instagram}`;
                break; // this prevents fallthrough
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
        <View style={{ flex: 1 }}>
            <View style={styles.topContainer}>
                {userProfile.pfp ? (<Image
                    // pfp would go here
                    style={{ width: 45, height: 45, borderRadius: 75, }}
                    source={{ uri: userProfile?.pfp }}

                />) :
                    (<View style={{ backgroundColor: colors.loginGray, width: 45, height: 45, borderRadius: 75, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        <User size={24} />
                    </View>)
                }
                <View style={styles.headerTextContainer}>
                    <Text style={styles.nameText}>
                        {userProfile?.name || "Nameless"}
                    </Text>
                    <Text style={{ fontFamily: 'inter', fontSize: 18, color: colors.accentGray }}>
                        {userProfile?.email || "Nameless"}
                    </Text>

                </View>
            </View>

            <ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
                style={styles.scrollContainer}
            >

                <View style={[{ width: '100%', display: 'flex', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },]}>

                    <TouchableOpacity style={[styles.followButton, styles.shadow, { shadowColor: followingUser ? colors.neonBlue : colors.accentGray }]}
                        onPress={() => handleFollow()}
                    >

                        {followingUser ? <Check size={18} color={followingUser ? colors.neonBlue : colors.accentGray} /> : <Plus size={18} color={colors.accentGray} />}
                        <Text style={[styles.followText, { color: followingUser ? colors.neonBlue : colors.accentGray }]}>
                            Follow{followingUser && 'ing'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.followButton, styles.shadow]}
                        onPress={() => handleMessage()}
                    >
                        <EnvelopeSimple size={18} color={colors.accentGray} />
                        <Text style={[styles.followText, { backgroundColor: 'white' }]}>
                            Message
                        </Text>
                    </TouchableOpacity>
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


                    {(userProfile.instagram || userProfile.linkedin || userProfile.twitter) && (<View style={styles.socials}>

                        {userProfile.instagram && <TouchableOpacity
                            style={styles.socialContainer}
                            onPress={() => openSocial('instagram')}
                        >
                            {loadingIG ? (<ActivityIndicator />) : (<Image
                                source={require('../../../assets/images/IG_logo.png')}
                                style={{ width: 30, height: 30, borderRadius: 5 }}
                            />)}
                            <Text style={styles.socialText}>
                                {'@' + userProfile.instagram}
                            </Text>
                        </TouchableOpacity>}

                        {userProfile.linkedin && <TouchableOpacity
                            style={styles.socialContainer}
                            onPress={() => openSocial('linkedin')}
                        >
                            <Image
                                source={require('../../../assets/images/LI_logo.png')}
                                style={{ width: 30, height: 30, borderRadius: 5 }}
                            />
                            <Text numberOfLines={1}
                                style={styles.socialText}>
                                {'@' + userProfile.linkedin}
                            </Text>
                        </TouchableOpacity>}


                    </View>)}

                    <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600', marginLeft: 6 }}>
                        Listings
                    </Text>
                </View>




                {userListings ? <ListingsList listings={userListings} navigation={navigation} scrollEnabled={false} /> : (
                    <View style={{ marginTop: 30 }}>
                        <Text style={{ fontFamily: 'inter', fontSize: 16 }}>
                            User has no listings!
                        </Text>
                    </View>
                )}

            </ScrollView >
        </View>

    )

}

export default UserProfile;

const styles = StyleSheet.create({
    scrollContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignSelf: 'center',
        paddingHorizontal: 15
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: 15
    },
    headerTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 12,
        marginBottom: 6

    },
    nameText: {
        fontSize: 24,
        fontWeight: '600',
        fontFmaily: 'inter'
    },
    netIDText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'gray',
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
        marginTop: 10,
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 25,
        height: 70
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
        fontSize: 18,
        fontFamily: 'inter',
        color: colors.loginBlue,
        maxWidth: '80%',
    }
})
