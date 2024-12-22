import { FlatList, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import ListingCard from "./ListingCard"
import { colorKeys, MotiView } from 'moti';
import { useCallback, useContext, useEffect } from "react";
import { userContext } from "../context/UserContext";
import { colors } from "../colors";
import { FlashList } from '@shopify/flash-list'
import { Dimensions } from "react-native";



const ListingsList = ({ listings,
    navigation,
    scrollEnabled = true,
    refreshing = false, // essentially loading state for refreshing
    onRefresh = () => { },
    onEndReached = () => { },
    onEndReachedThreshold = 0.5,
    ListFooterComponent = null,
}) => {
    const { user } = useContext(userContext)

    if (!listings || listings.length === 0) {
        return null
    }


    const renderItem = useCallback(async ({ item }) => {
        return (
            <TouchableOpacity
                disabled={item.sold && user.uid !== item.userId}
                onPress={() => navigation.navigate('ListingScreen', { listingID: item.id })}
                style={{ flex: 1, padding: 1 }}
            >
                <ListingCard
                    listing={item}
                />
            </TouchableOpacity>
        )
    })

    return (
        <View style={{ flex: 1, width: '100%' }}>


            <FlashList
                // contentContainerStyle={styles.container}
                // estimatedListSize={{
                //     height: Dimensions.get('window').height,
                //     width: Dimensions.get('window').width,
                // }}
                estimatedItemSize={200} // need this for flashlist to work
                // styling in flashList
                contentContainerStyle={{
                    padding: 2, // pad the whole list
                }}
                columnWrapperStyle={{
                    gap: 2, // space between listings
                    paddingHorizontal: 2, // gap
                }}
                numColumns={2}
                ListHeaderComponent={null} // blank for now, this is where a header would go.

                data={listings}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}

                // this allows us to customize the refresh spinner
                // custom spinner is a lot harder––RN problem
                // refreshControl={
                //     <RefreshControl
                //         refreshing={refreshing}
                //         onRefresh={onRefresh}
                //         tintColor={colors.loginBlue}
                //         colors={[colors.loginBlue, colors.loginBlue, colors.loginBlue]}
                //     />
                // }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    <View style={{ width: 1, height: 20 }}>
                        {ListFooterComponent}
                    </View>
                }

                renderItem={renderItem} // memoized
                keyExtractor={item => item.id} // use the conversationID as a key

                // OPTIMIZATIONS
                // Define precise number of items that would cover the screen for every device. This can be a big performance boost for the initial render.
                initialNumToRender={6}       // how many items to render initially

                // how many screens worth of content to render offscreen (maybe tune to 3)
                // For a bigger windowSize, you will have more memory consumption. For a lower windowSize, you will have a bigger chance of seeing blank areas.
                // DEFAULT IS 21
                windowSize={4}
                // how many items to render per batch           
                maxToRenderPerBatch={10}
                // used to batch renders . Combine with maxToRenderPerBatch. default is 50ms, is the time gap between renders. 
                updateCellsBatchingPeriod={50}
            // might have bugs, per react native docs. Commented out for now
            // removeClippedSubviews={true} // basically removes the stuff off of the screen. Can help memory management
            // drawDistance={800} // increases the amount of scroll. Might be a stupid amount

            // estimatedListSize

            />
        </View>
    )
}

export default ListingsList;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 1,
        backgroundColor: 'green',
    },
    skeletonCard: {
        width: '100%'
    },
    column: {
        justifyContent: 'space-between',
        marginTop: 0
    }
})