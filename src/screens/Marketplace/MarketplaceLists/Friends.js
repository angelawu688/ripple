import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { colors } from "../../../constants/colors"
import { useCallback, useContext, useEffect, useState } from "react"
import { userContext } from "../../../context/UserContext"
import * as Linking from 'expo-linking'
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore";
import ListingsListSkeletonLoaderFull from "../../../components/listings/ListingsListSkeletonLoaderFull";
import { useFocusEffect } from "@react-navigation/native"
import ListingsList from "../../../components/listings/ListingsList"
import { PaperPlane, PaperPlaneTilt } from "phosphor-react-native"


const Friends = ({ navigation }) => {
    const { user, userData, userFollowingIds } = useContext(userContext)
    const [friendsListings, setFriendsListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // grab the friends listings on component mount
    const db = getFirestore();

    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [userFollowingIds])
    );

    const fetchListings = useCallback(async () => {
        try {

            // not following anyone
            if (userFollowingIds.length === 0) {
                setFriendsListings([]);
                return;
            }

            //    TODO PAGINATION
            const listingsQuery = query(
                collection(db, 'listings'),
                where('userId', 'in', userFollowingIds),
                where("sold", "==", false),
                orderBy("createdAt", "desc"),
                limit(10)
            );
            const listingsSnapshot = await getDocs(listingsQuery);
            const friendsListingsData = listingsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setFriendsListings(friendsListingsData);
        } catch (error) {
            console.error("Error fetching friends listings:", error);
        } finally {
            // TODO: need to handle when isLoading is true
            setIsLoading(false);
        }
    }, [userFollowingIds, db]);

    const shareProfile = () => {
        if (!userData?.uid) {
            return
        }
        const profileLink = Linking.createURL(`user/${userData.uid}`)
        const messageBody = `Follow me on Ripple!\n${profileLink}`
        const smsURL = `sms:&body=${encodeURIComponent(messageBody)}`

        try {
            Linking.openURL(smsURL)
        } catch (e) {
            console.log(e)
        }
        // example dev URL from expo: exp://10.155.102.135:8081/--/user/RsYuNgUxSUTm0xdD0CMi6Yhkjc73 
        // prod urls will look different
        // we will need to use firebase dynamic URLs so that people without the app will be prompted to go download
    }

    // loading
    // the double check of !friendsListing prevents the little hitch
    if (isLoading || !friendsListings) {
        return (
            <ListingsListSkeletonLoaderFull />
        )
    } else if (friendsListings?.length === 0) { // not loading, friendsListing is empty
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.title}>
                    Don't see any items?
                </Text>
                <Text style={styles.subTitle}>
                    Your friend's listings will appear here
                </Text>
                <TouchableOpacity onPress={() => shareProfile()}

                    style={styles.button}>
                    <PaperPlaneTilt size={24} color='white' style={{ marginRight: 8 }} />
                    <Text style={[styles.title, { color: 'white' }]}>
                        Share profile
                    </Text>
                </TouchableOpacity>
            </View>
        )
    } else {
        // pass in a function to get more ?
        // i.e. onGetMore={getMoreFriendsPosts()} or something
        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <ListingsList
                    navigation={navigation}
                    listings={friendsListings}
                    showCollegeHeader={true}
                />
            </View>
        )
    }
}

export default Friends


const styles = StyleSheet.create({
    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: 'white'
    },
    title: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '500',
        textAlign: 'center'
    },
    button: {
        width: 200,
        height: 45,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 15,
        backgroundColor: colors.loginBlue
    },
    emptyContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    subTitle: {
        fontSize: 16,
        fontFamily: 'inter',
        marginVertical: 8
    }
})