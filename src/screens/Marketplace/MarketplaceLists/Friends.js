import { FlatList, Text, TouchableOpacity, View } from "react-native"
import ListingCard from "../../../components/ListingCard"


const Friends = ({ listings, navigation }) => {
    if (!listings) {
        return (
            <View style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text>
                    Posts from your friends will show up here!
                </Text>
            </View>
        )
    }

    return (
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
    )

}

export default Friends