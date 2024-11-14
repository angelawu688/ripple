import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import ListingCard from "../../../components/ListingCard"
import { GestureHandlerRootView } from 'react-native-gesture-handler';



const Sell = ({ activeListings, navigation }) => {
    return (

        <View style={{ height: '100%', width: '94%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignSelf: 'center' }}>

            <TouchableOpacity onPress={() => navigation.navigate('CreateListing')}

                style={[styles.shadow, styles.topTitle]}>
                <Text style={{ fontFamily: 'inter', fontSize: 16 }}>
                    Create listing
                </Text>
            </TouchableOpacity>

            {activeListings ? (<FlatList
                style={{ width: '99%', alignSelf: 'center' }}
                columnWrapperStyle={{
                    justifyContent: 'space-between',
                    marginTop: 0
                }}
                ListHeaderComponent={null} // blank for now, this is where a header would go.
                numColumns={2} // this is how we put them side by side
                data={activeListings}
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
            />) : (
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', height: '70%', width: '70%', alignSelf: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: 'inter', fontWeight: '600', marginBottom: 12 }}>
                        Ready to sell?
                    </Text>
                    <Text style={{ fontFamily: 'inter', fontSize: 16, textAlign: 'center' }}>
                        Your listings will appear here after your first post.
                    </Text>
                </View>
            )}

        </View>
    )
}

export default Sell

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 2,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 8,
    },
    topTitle: {
        backgroundColor: 'white',
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginBottom: 12
    }
})