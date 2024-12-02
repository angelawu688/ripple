import { FlatList, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import ListingCard from "./ListingCard"
import { MotiView } from 'moti';
import { useContext } from "react";
import { userContext } from "../context/UserContext";



const ListingsList = ({ listings, navigation, scrollEnabled = true }) => {
    const { user } = useContext(userContext)
    if (!listings || listings.length === 0) {
        return null
    }

    return (
        <FlatList
            style={styles.container}
            columnWrapperStyle={styles.column}
            ListHeaderComponent={null} // blank for now, this is where a header would go.
            numColumns={2} // this is how we put them side by side
            data={listings}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            renderItem={({ item }) => { // note: need to keep as "items", we are just renaming it to be clear
                return (
                    <TouchableOpacity
                        disabled={item.sold && user.uid !== item.userId}
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

const styles = StyleSheet.create({
    container: {
        width: '99%',
        alignSelf: 'center',
    },
    skeletonCard: {
        width: '49.75%'
    },
    column: {
        justifyContent: 'space-between',
        marginTop: 0
    }
})