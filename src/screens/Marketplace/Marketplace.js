import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { getFirestore, doc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore";

import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../colors'
import { useEffect, useState } from "react";

import ListingCard from '../../components/ListingCard'
import ForYou from './MarketplaceLists/ForYou'
import Friends from './MarketplaceLists/Friends'
import Sell from './MarketplaceLists/Sell'
import Search from './MarketplaceLists/Search'
import { Plus } from "phosphor-react-native";


const testPosts = [
    { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    { listingID: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
    { listingID: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
    { listingID: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: false },
    { listingID: 5, img: undefined, title: 'Catan Set', price: 10, sold: false },
    { listingID: 6, img: undefined, title: 'Catan Expansion Pack', price: 10, sold: false },
    { listingID: 7, img: undefined, title: 'Exploding Kittens', price: 40, sold: true },
    { listingID: 8, img: undefined, title: 'Macbook Pro', price: 100, sold: false },
    { listingID: 9, img: undefined, title: 'Comfy Couch', price: 40, sold: false },
    { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
]


const testFriendsListings = [
    { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    { listingID: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
    { listingID: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
    { listingID: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: false },
    { listingID: 5, img: undefined, title: 'Catan Set', price: 10, sold: false },
]

const testActiveListings = [
    { listingID: 9, img: undefined, title: 'Comfy Couch', price: 40, sold: false },
]

const Marketplace = ({ navigation }) => {
    // TODO refactor for clarity
    const totalUsers = '2.3k' // grab the total rows from the users DB and cache it


    const [listings, setListings] = useState(testPosts)
    const [isLoading, setIsLoading] = useState(true)

    // possible options are foryou, friends, sell, search
    const [selectedOption, setSelectedOption] = useState('foryou')

    const db = getFirestore();
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const listingsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setListings(listingsData);
            } catch (error) {
                console.error("Error fetching listings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListings();
    }, []);

    const renderSelectedOption = () => {
        // NOTE:
        // just pass in undefined to test the empty case
        // this will throw an error for now
        switch (selectedOption) {
            case 'foryou':
                return <ForYou listings={listings} navigation={navigation} />
            case 'friends':
                return <Friends listings={listings} navigation={navigation} />
            case 'sell':
                return <Sell activeListings={listings} navigation={navigation} />
            case 'search':
                return <Search navigation={navigation} />
            default:
                return <Text>Oops! Option not found.</Text>
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.upperContainer}>

                {/* top menu bar */}
                <TouchableOpacity
                    onPress={() => setSelectedOption('foryou')}
                    style={[selectedOption === 'foryou' && styles.shadow, styles.topTitle]}>

                    {/* style={{ marginRight: 45, backgroundColor: 'white', borderWidth: 1, borderRadius: 10, padding: 6, paddingHorizontal: 14, }}> */}
                    <Text style={styles.tabTextStyle}>
                        For you
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedOption('friends')}
                    style={[selectedOption === 'friends' && styles.shadow, styles.topTitle]}>
                    <Text style={styles.tabTextStyle}>
                        Friends
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedOption('sell')}
                    style={[selectedOption === 'sell' && styles.shadow, styles.topTitle]}>
                    <Text style={styles.tabTextStyle}>
                        Sell
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedOption('search')}
                    style={[selectedOption === 'search' && styles.shadow, styles.topTitle]}>

                    <Ionicons name="search" size={30} color="#000" />
                </TouchableOpacity>


            </View>


            {/* college header */}
            {selectedOption !== 'sell' && selectedOption !== 'search' && <View style={styles.collegeHeaderContainer}>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 8, }}><Ionicons name={'location'} size={24} color={colors.uwPurple} /></View>

                    <Text style={[styles.tabTextStyle, { color: colors.uwPurple }]}>University of Washington</Text>
                </View>
                <Text style={{ color: colors.darkgray, fontSize: 14, fontFamily: 'inter' }}>{totalUsers} users</Text>
            </View>
            }



            {isLoading ? <ActivityIndicator size="large" /> : renderSelectedOption()}

            <TouchableOpacity onPress={() => navigation.navigate('CreateListing')}

                style={{ backgroundColor: 'white', borderColor: colors.darkblue, width: 60, height: 60, borderRadius: 50, borderWidth: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', shadowColor: colors.neonBlue, shadowOpacity: 0.4, shadowRadius: 3, position: 'absolute', bottom: 15, right: 15 }}>
                <Plus color={colors.darkblue} size={30} />
            </TouchableOpacity>
        </View>
    )
}

export default Marketplace

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    collegeHeaderContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        flexDirection: 'row',
        marginVertical: 12
    },
    iconPlaceholder: {
        width: 30,
        height: 30,
        backgroundColor: 'black'
    },
    tabTextStyle: {
        fontSize: 18,
        fontFamily: 'inter',
    },
    upperContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginTop: 20,
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    topTitle: {
        backgroundColor: 'white',
        height: 36,
        paddingHorizontal: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15
    }
})