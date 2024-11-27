import { FlatList, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import ListingCard from "../../../components/ListingCard"




const ForYou = ({ listings, navigation }) => {

    if (!listings) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.title}>
                    No posts found!
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

export default ForYou;

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '600',
        textAlign: 'center'
    },
    emptyContainer: {
        display: 'flex',
        height: '70%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
})