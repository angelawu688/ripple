import { FlatList, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import ListingCard from "../../../components/listings/ListingCard"
import ListingsList from "../../../components/listings/ListingsList"
import LoadingSpinner from '../../../components/LoadingSpinner'

const ForYou = ({
    listings,
    navigation,
    refreshing,
    onRefresh,
    onLoadMore,
    loadingMore // tells us what to pass in for the footer
}) => {

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
        <ListingsList
            listings={listings}
            navigation={navigation}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEndReached={onLoadMore}
            onEndReachedThreshold={0.5} // tune? Something to play w
            ListFooterComponent={
                loadingMore ? <LoadingSpinner /> : null
            }
        />
        // <FlatList
        //     style={{ width: '99%', alignSelf: 'center' }}
        //     columnWrapperStyle={{
        //         justifyContent: 'space-between',
        //         marginTop: 0
        //     }}
        //     ListHeaderComponent={null} // blank for now, this is where a header would go.
        //     numColumns={2} // this is how we put them side by side
        //     data={listings}
        //     showsVerticalScrollIndicator={false}
        //     renderItem={({ item }) => { // note: need to keep as "items", we are just renaming it to be clear
        //         return (
        //             <TouchableOpacity
        //                 onPress={() => navigation.navigate('ListingScreen', { listingID: item.id })}
        //                 style={{ width: '49.75%' }}
        //             >
        //                 <ListingCard
        //                     listing={item}
        //                 />

        //             </TouchableOpacity>
        //         )
        //     }}
        //     keyExtractor={item => item.id} // use the conversationID as a key

        //     // this is where we will put the handling to load more
        //     onEndReachedThreshold={null}
        //     onEndReached={null}
        // />
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