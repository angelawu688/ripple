import { FlatList, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import ListingsList from "../../../components/listings/ListingsList"
import LoadingSpinner from '../../../components/LoadingSpinner'
import { useListingsData } from "../../../hooks/useListingsData"
import ListingsListSkeletonLoaderFull from "../../../components/listings/ListingsListSkeletonLoaderFull"

const ForYou = ({ navigation }) => {
    const {
        listings,
        isLoading,
        refreshing,
        onRefresh,
        onLoadMore,
        loadingMore // tells us what to pass in for the footer
    } = useListingsData('foryou')

    if (isLoading) {
        return <ListingsListSkeletonLoaderFull />
    }

    if (!listings?.length && !isLoading) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.title}>
                    No posts found!
                </Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
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
                showCollegeHeader={true}
            />
        </View>
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
        alignItems: 'center',
    }
})