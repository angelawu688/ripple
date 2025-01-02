import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/listings/ListingCard'
import ListingsList from '../../components/listings/ListingsList'

const YourListings = ({ navigation }) => {
    const { userListings } = useContext(userContext)
    const [yourListings, setYourListings] = useState([])
    const [activeListings, setActiveListings] = useState([])
    const [pastListings, setPastListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        setIsLoading(true)
        try {
            // grab the users saved listings on component mount
            setYourListings(userListings)
        } catch (error) {
            console.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }, [userListings])

    useEffect(() => {
        setIsLoading(false)
        const active = yourListings.filter(listing => listing.sold === false)
        const past = yourListings.filter(listing => listing.sold === true)
        setActiveListings(active)
        setPastListings(past)
        // cleanup function
    }, [yourListings])

    if (isLoading) {
        return <FullLoadingScreen />
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* <View style={styles.listingContainer}> */}
            <Text style={styles.text}>
                Active Listings
            </Text>
            {activeListings?.length !== 0 ? (<ListingsList
                scrollEnabled={false}
                navigation={navigation}
                listings={activeListings}
            />) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Your active listings will appear here
                    </Text>
                </View>
            )}
            {/* </View> */}

            {/* <View style={styles.listingContainer}> */}
            <Text style={styles.text}>
                Sold Listings
            </Text>
            {pastListings?.length !== 0 ? (<ListingsList
                scrollEnabled={false}
                navigation={navigation}
                listings={pastListings}
            />) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Your sold listings will appear here
                    </Text>
                </View>
            )}
            {/* </View> */}

        </ScrollView>
    )
}

export default YourListings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%'
    },
    contentContainer: {
        paddingHorizontal: 1,
        alignItems: 'center',
    },
    text: {
        fontFamily: 'inter',
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 16,
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginLeft: 24
    },
    emptyContainer: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        paddingVertical: 12
    },
    emptyText: {
        fontFamily: 'inter',
        fontSize: 16
    }
})