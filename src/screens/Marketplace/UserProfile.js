import { useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import ForYou from "./MarketplaceLists/ForYou";
import { Ionicons } from "@expo/vector-icons";
import {collection, doc, getDoc, getDocs, getFirestore, query, where} from "firebase/firestore";
import FullLoadingScreen from "../shared/FullLoadingScreen";
import ListingsList from '../../components/ListingsList'
import { Check, EnvelopeSimple, InstagramLogo, LinkedinLogo, Mailbox, Plus, User, XLogo } from "phosphor-react-native";
import { colors } from "../../colors";

const testUserPosts = [
    { id: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    { id: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
    { id: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
    { id: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: true },
    { id: 5, img: undefined, title: 'Catan Set', price: 10, sold: true },
]
const UserProfile = ({ navigation, route }) => {
    const { userID } = route.params
    const [followingUser, setFollowingUser] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [userProfile, setUserProfile] = useState(null) // avoid using "user" because we have a context for that
    const [userListings, setUserListings] = useState([])

    const [loadingIG, setLoadingIG] = useState(false)
    const [loadingX, setLoadingX] = useState(false)
    const [loadingLI, setLoadingLI] = useState(false)

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
            setUserProfile(prevProfile => ({
                ...prevProfile,
                instagram: 'williamhuntt',
                twitter: 'nfl',
                linkedin: 'https://www.linkedin.com/in/william-hunt-7895a3212/'
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
            case ('twitter'):
                setLoadingX(true)
                if (!userProfile.twitter) {
                    Alert.alert('Error', 'No X user found')
                    return;
                }
                url = `https://x.com/${userProfile.twitter}`;
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
            setLoadingX(false)
            setLoadingLI(false)
        }
    }

    return (
        <View style={styles.container}>
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

            <View style={[{ width: '100%', display: 'flex', backgroundColor: 'white', flexDirection: 'row', borderRadius: 12, marginVertical: 16, height: 35, alignItems: 'center' }, styles.shadow, { shadowColor: followingUser ? colors.neonBlue : colors.accentGray }]}>
                <TouchableOpacity style={styles.followButton}
                    onPress={() => handleFollow()}
                >

                    {followingUser ? <Check size={18} color={followingUser ? colors.neonBlue : colors.accentGray} /> : <Plus size={18} color={colors.accentGray} />}
                    <Text style={[styles.followText, { color: followingUser ? colors.neonBlue : colors.accentGray }]}>
                        Follow{followingUser && 'ing'}
                    </Text>
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: colors.accentGray, height: '100%' }} />
                <TouchableOpacity style={styles.followButton}
                    onPress={() => handleMessage()}
                >
                    <EnvelopeSimple size={18} colors={colors.accentGray} />
                    <Text style={styles.followText}>
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
                        <Text style={{ fontFamily: 'inter', fontSize: 16, color: colors.accentGray, fontWeight: '500' }}>
                            {userProfile.concentration}
                        </Text>
                    </View>
                    <Text style={styles.majorText}>
                        {userProfile.gradYear}
                    </Text>
                </View>

                <View style={{ marginTop: 12, width: '100%', maxHeight: 128, marginBottom: 0 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                        {userProfile.bio}
                    </Text>
                </View>


                {(userProfile.instagram || userProfile.linkedin || userProfile.twitter) && (<View style={styles.socials}>

                    {userProfile.instagram && <TouchableOpacity
                        onPress={() => openSocial('instagram')}
                    >
                        {loadingIG ? <ActivityIndicator color={'black'} /> : <InstagramLogo size={30} color={'black'} />}
                    </TouchableOpacity>}

                    {userProfile.linkedin && <TouchableOpacity
                        onPress={() => openSocial('linkedin')}
                    >
                        {loadingLI ? <ActivityIndicator color={'black'} /> : <LinkedinLogo size={30} color={'black'} />}
                    </TouchableOpacity>}

                    {userProfile.twitter && <TouchableOpacity
                        onPress={() => openSocial('twitter')}
                    >
                        {loadingX ? <ActivityIndicator color={'black'} /> : <XLogo size={30} color={'black'} />}
                    </TouchableOpacity>}
                </View>)}

                <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600', marginLeft: 6 }}>
                    Listings
                </Text>
            </View>




            {
                userListings ? <ListingsList listings={userListings} navigation={navigation} /> : (
                    <View style={{ marginTop: 30 }}>
                        <Text style={{ fontFamily: 'inter', fontSize: 16 }}>
                            User has no listings!
                        </Text>
                    </View>
                )
            }

        </View >
    )

}

export default UserProfile;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        width: '92%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        alignSelf: 'center',
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%'
    },

    headerTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 12

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
        marginTop: 20
    },
    socials: {
        flexDirection: 'row',
        marginTop: 10,
        width: 120,
        justifyContent: 'space-between',
    },

    followText: { marginLeft: 4, fontSize: 15, fontFamily: 'inter', color: colors.accentGray },
    followButton: { width: '50%', height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
    shadow: {
        shadowColor: colors.accentGray,
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    majorText: {
        fontFamily: 'inter',
        fontSize: 18,
        fontWeight: '600',
        color: colors.uwPurple
    }
})
