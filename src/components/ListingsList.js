import { FlatList, View, Text, TouchableOpacity } from "react-native"
import ListingCard from "./ListingCard"


const ListingsList = ({ listings, navigation, emptyMessage }) => {
    console.log(listings)
    // we want to return nothing if there are no listings
    if (!listings) {
        return null
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
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => { // note: need to keep as "items", we are just renaming it to be clear
                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ListingScreen', { listingID: item.id })}
                        style={{ width: '49.75%' }}
                    >
                        <ListingCard
                            listing={item}
                        />

                    </TouchableOpacity>
                )
            }}
            keyExtractor={item => item.id} // use the conversationID as a key

            // this is where we will put the handling to load more
            onEndReachedThreshold={null}
            onEndReached={null}
        />
    )
}

export default ListingsList;