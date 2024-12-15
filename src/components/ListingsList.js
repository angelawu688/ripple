import { FlatList, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import ListingCard from "./ListingCard"
import { colorKeys, MotiView } from 'moti';
import { useContext, useEffect } from "react";
import { userContext } from "../context/UserContext";
import { colors } from "../colors";



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

    return (
        <FlatList
            style={styles.container}
            columnWrapperStyle={styles.column}
            ListHeaderComponent={null} // blank for now, this is where a header would go.
            numColumns={2} // this is how we put them side by side
            data={listings}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}

            // this allows us to customize the refresh spinner
            // custom spinner is a lot harder––RN problem
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.loginBlue}
                    colors={[colors.loginBlue, colors.loginBlue, colors.loginBlue]}
                />
            }


            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}

            ListFooterComponent={
                <View style={{ width: 1, height: 20 }}>
                    {ListFooterComponent}
                </View>

            }


            keyExtractor={item => item.id} // use the conversationID as a key
            // this is where we will put the handling to load more
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