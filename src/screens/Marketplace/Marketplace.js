import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { getFirestore, doc, setDoc } from "firebase/firestore";

import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../colors'
import { useEffect, useState } from "react";

import ListingCard from '../../components/ListingCard'
import ForYou from './MarketplaceLists/ForYou'
import Friends from './MarketplaceLists/Friends'
import Sell from './MarketplaceLists/Sell'
import Search from './MarketplaceLists/Search'


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



    const [listings, setListings] = useState(testPosts)
    const [isLoading, setIsLoading] = useState(true)

    // possible options are foryou, friends, sell, search
    const [selectedOption, setSelectedOption] = useState('foryou')

    useEffect(() => {
        // grab the posts on component mount?
        // use context?
        if (listings) {
            setIsLoading(false)
        } else {
            // do nothing
        }
    }, [listings])

    const renderSelectedOption = () => {
        // NOTE:
        // just pass in undefined to test the empty case
        switch (selectedOption) {
            case 'foryou':
                return <ForYou listings={listings} navigation={navigation} />
            case 'friends':
                return <Friends listings={testFriendsListings} navigation={navigation} />
            case 'sell':
                return <Sell activeListings={testActiveListings} navigation={navigation} />
            case 'search':
                return <Search />
            default:
                return <Text>Oops! Option not found.</Text>
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.upperContainer}>

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

            {selectedOption !== 'sell' && <View style={styles.collegeHeaderContainer}>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 8, }}><Ionicons name={'location'} size={24} color={'black'} /></View>

                    <Text style={styles.tabTextStyle}>University of Washington</Text>
                </View>
                <Text style={{ color: colors.darkgray, fontSize: 14, fontFamily: 'inter' }}>2.3k Users</Text>
            </View>
            }


            {/* this is the flatlist for the posts */}

            {isLoading ? <ActivityIndicator size="large" /> : renderSelectedOption()}

            {isLoading && <ActivityIndicator size={'large'} />}

            {selectedOption === 'foryou' && ForYou}

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
        fontFamily: 'inter'

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
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
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