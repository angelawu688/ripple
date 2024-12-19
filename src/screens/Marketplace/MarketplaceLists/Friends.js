import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native"
import ListingCard from "../../../components/ListingCard"
import { colors } from "../../../colors"
import ListingsList from "../../../components/ListingsList"
import { useCallback, useContext, useEffect, useState } from "react"
import { userContext } from "../../../context/UserContext"
import * as Linking from 'expo-linking'
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from "firebase/firestore";
import ListingsListSkeletonLoaderFull from "../../../components/ListingsListSkeletonLoaderFull";
// import { useFocusEffects } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"


const Friends = ({ navigation }) => {
    const { user, userData, userFollowingIds } = useContext(userContext)
    const [friendsListings, setFriendsListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // grab the friends listings on component mount
    const db = getFirestore();

    useFocusEffect(
        useCallback(() => {
            fetchListings();
        }, [fetchListings])
    );

    const fetchListings = useCallback(async () => {
        try {
            // get following ids
            // TODO:
            // kinda expensive, use context to simplify this?
            // const followingQuery = query(
            //     collection(db, 'following'),
            //     where('follower_id', '==', user.uid)
            // );
            // const followingData = await getDocs(followingQuery);
            // const followingIds = followingData.docs.map(doc => doc.data().following_id);
            console.log("userFollowingIds length is", userFollowingIds.length)

            // not following anyone
            if (userFollowingIds.length === 0) {
                setFriendsListings([]);
                return;
            }

            // get listings from ppl we're following
            // only gets 10 ids
            // TODO: fix this so we can get more than 10
            const listingsQuery = query(
                collection(db, 'listings'),
                where('userId', 'in', userFollowingIds),
                where("sold", "==", false),
                orderBy("createdAt", "desc"),
                limit(32)
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
            console.log('gotta wait lol we not loaded')
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
        // example dev URL: exp://10.155.102.135:8081/--/user/RsYuNgUxSUTm0xdD0CMi6Yhkjc73 
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

                    style={[styles.shadow, styles.button]}>
                    <Text style={[styles.title,]}>
                        Share profile
                    </Text>
                </TouchableOpacity>
            </View>
        )
    } else {
        // pass in a function to get more ?
        // i.e. onGetMore={getMoreFriendsPosts()} or something
        return (
            <ListingsList navigation={navigation} listings={friendsListings} />
        )
    }

    // // empty
    // if (friendsListings?.length === 0 && !isLoading) {
    //     return (
    //         <View style={styles.emptyContainer}>
    //             <Text style={styles.title}>
    //                 Don't see any items?
    //             </Text>
    //             <Text style={styles.subTitle}>
    //                 Your friend's listings will appear here
    //             </Text>
    //             <TouchableOpacity onPress={() => shareProfile()}

    //                 style={[styles.shadow, styles.button]}>
    //                 <Text style={[styles.title,]}>
    //                     Share profile
    //                 </Text>
    //             </TouchableOpacity>
    //         </View>
    //     )
    // }
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
        fontWeight: '600',
        textAlign: 'center'
    },
    button: {
        width: 200,
        height: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 15,
    },
    emptyContainer: {
        display: 'flex',
        height: '70%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    subTitle: {
        fontSize: 16,
        fontFamily: 'inter',
        marginVertical: 8
    }
})