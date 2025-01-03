import { FlatList, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import ListingCard from ".//ListingCard"
import { colorKeys, MotiView } from 'moti';
import { useCallback, useContext, useEffect } from "react";
import { userContext } from "../../context/UserContext";
import { FlashList } from '@shopify/flash-list'
import { Dimensions } from "react-native";
import UWHeader from "../UWHeader";

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = (SCREEN_WIDTH - 6) / 2
const ITEM_HEIGHT = ITEM_WIDTH + 30;  // 30 is an estimate for the text


const ListingsList = ({ listings,
    navigation,
    scrollEnabled = true,
    refreshing = false, // essentially loading state for refreshing
    onRefresh = () => { },
    onEndReached = () => { },
    onEndReachedThreshold = 0.5,
    isOwnProfile = false,
    ListFooterComponent = null,
    showCollegeHeader = false
}) => {
    const { user } = useContext(userContext)

    if (!listings || listings.length === 0) {
        return null
    }


    const renderItem = useCallback(({ item }) => {
        const isClickDisabled = !isOwnProfile && item.sold;
        return (
            <TouchableOpacity
                disabled={isClickDisabled && false}
                onPress={() => navigation.navigate('ListingScreen', { listingID: item.id })}
                style={{ flex: 1, padding: 1 }}
            >
                <ListingCard
                    listing={item}
                />
            </TouchableOpacity >
        )
    })

    const keyExtractor = useCallback((item) => item.id, [])

    return (
        <View style={{ flex: 1, width: '100%' }}>


            <FlashList
                // non-negotiables
                contentContainerStyle={{
                    padding: 2, // pad the whole list
                }}
                columnWrapperStyle={{
                    gap: 2, // space between listings
                    paddingHorizontal: 2, // gap
                }}
                numColumns={2}
                ListHeaderComponent={
                    showCollegeHeader && <UWHeader />
                } // blank for now, this is where a header would go.
                data={listings}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                onEndReached={onEndReached}
                // onEndReachedThreshold={0.2}
                ListFooterComponent={
                    <View style={{ width: 1, height: 50 }}>
                        {ListFooterComponent}
                    </View>
                }

                renderItem={renderItem} // memoized
                keyExtractor={keyExtractor} // using convID as a key


                // ________________________________________________________________________________
                // OPTIMIZATIONS                
                estimatedItemSize={229}
                windowSize={3}
                onRefresh={
                    onRefresh
                }
                refreshing={refreshing}
            // getItemLayout={(data, index) => (
            //     { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
            // )}

            // maxToRenderPerBatch={2}



            // initialNumToRender={4}       // how many items to render initially
            // updateCellsBatchingPeriod={50}


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


            // Define precise number of items that would cover the screen for every device. This can be a big performance boost for the initial render.


            // how many screens worth of content to render offscreen (maybe tune to 3)
            // For a bigger windowSize, you will have more memory consumption. For a lower windowSize, you will have a bigger chance of seeing blank areas.
            // DEFAULT IS 21

            // how many items to render per batch           

            // used to batch renders . Combine with maxToRenderPerBatch. default is 50ms, is the time gap between renders. 

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