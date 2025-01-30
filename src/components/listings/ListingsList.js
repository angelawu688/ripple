import { FlatList, View, Text, TouchableOpacity, StyleSheet, RefreshControl, Pressable } from "react-native"
import ListingCard from ".//ListingCard"
import { colorKeys, MotiView } from 'moti';
import { useCallback, useContext, useEffect, useState } from "react";
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
    onEndReachedThreshold = 0.2,
    isOwnProfile = false,
    ListFooterComponent = null,
    showCollegeHeader = false
}) => {
    const { user } = useContext(userContext)
    const [filteredListings, setFilteredListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // makes slower, but we wont see any blocked listing
    // we arent actually using this atm
    // were able to pass ASC without this lmao
    useEffect(() => {
        const filterBlockedListings = async () => {
            if (!user?.uid || !listings) return;

            const filtered = [];
            for (const listing of listings) {
                const isBlocked = await checkIfBlocked(listing.userId, user.uid);
                const hasBlocked = await checkIfBlocked(user.uid, listing.userId);

                if (!isBlocked && !hasBlocked) {
                    filtered.push(listing);
                }
            }
            setFilteredListings(filtered);
            setIsLoading(false);
        };

        filterBlockedListings();
    }, [listings, user?.uid]);

    if (!listings || listings.length === 0) {
        return null
    }

    const renderItem = useCallback(({ item }) => {
        const isClickDisabled = !isOwnProfile && item.sold;
        return (
            <Pressable
                disabled={isClickDisabled && false}
                onPress={() => navigation.navigate('ListingScreen', { listingID: item.id })}
                style={{ flex: 1, padding: 1 }}
            >
                <ListingCard
                    listing={item}
                />
            </Pressable>
        )
    })

    const keyExtractor = useCallback((item) => item.id, [])

    return (
        <View style={{ flex: 1, width: '100%' }}>
            <FlashList
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
                }
                data={listings}
                showsVerticalScrollIndicator={false}
                scrollEnabled={scrollEnabled}
                onEndReachedThreshold={onEndReachedThreshold}
                onEndReached={onEndReached}
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
            />
        </View>
    )
}

export default ListingsList;
