import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../colors'
import { useEffect, useState } from "react";

import ListingCard from '../../components/ListingCard'

const Marketplace = ({ navigation }) => {
    const [listings, setListings] = useState(testPosts)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // grab the posts on component mount?
        // use context?
        if (listings) {
            setIsLoading(false)
        } else {
            // do nothing
        }
    }, [listings])


    return (
        <View style={styles.container}>
            <View style={styles.upperContainer}>
                <TouchableOpacity style={{ marginRight: 45, backgroundColor: 'white', borderWidth: 1, borderRadius: 10, padding: 6, paddingHorizontal: 14, }}>
                    <Text style={styles.tabTextStyle}>
                        For you
                    </Text>
                </TouchableOpacity>


                <TouchableOpacity onPress={() => navigation.navigate('SellScreen')}

                    style={{ marginRight: 45, }}>
                    <Text style={styles.tabTextStyle}>
                        Sell
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginRight: 45, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

                    <Text style={styles.tabTextStyle}>
                        Categories
                    </Text>

                    <Ionicons name={'chevron-down'} size={24} color={'black'} />
                </TouchableOpacity>
            </View>
            <View style={styles.collegeHeaderContainer}>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 8, }}><Ionicons name={'location'} size={24} color={'black'} /></View>

                    <Text style={styles.tabTextStyle}>University of Washington</Text>
                </View>
                <Text style={{ color: colors.darkgray }}>2.3k Users</Text>
            </View>


            {/* this is the flatlist for the posts */}
            {isLoading || !listings ? (
                <ActivityIndicator size={'large'} />
            ) : (
                <FlatList
                    style={{ width: '99%', alignSelf: 'center' }}
                    columnWrapperStyle={{
                        justifyContent: 'space-between',
                        marginTop: 0
                    }}
                    ListHeaderComponent={null} // blank for now, this is where a header would go.
                    numColumns={2} // this is how we put them side by side
                    data={listings}
                    renderItem={({ item: listing }) => { // note: need to keep as "items", we are just renaming it to be clear
                        const listingID = listing.listingID
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ListingScreen', { listingID: listingID })}
                                style={{ width: '49.75%' }}
                            >
                                <ListingCard
                                    price={listing.price}
                                    title={listing.title}
                                    img={listing.img}
                                    sold={listing.sold}
                                />

                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={listing => listing.listingID} // use the conversationID as a key

                    // this is where we will put the handling to load more
                    onEndReachedThreshold={null}
                    onEndReached={null}

                />
            )}
        </View>
    )
}

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
        marginBottom: 12
    },
    iconPlaceholder: {
        width: 30,
        height: 30,
        backgroundColor: 'black'
    },
    tabTextStyle: {
        fontSize: 18,

    },
    upperContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginTop: 20,
        marginBottom: 16,
        justifyContent: 'flex-start'
    }
})