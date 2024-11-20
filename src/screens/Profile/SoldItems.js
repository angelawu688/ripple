

import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/ListingCard'
import ListingsList from '../../components/ListingsList'

const SoldItems = ({ navigation }) => {
    const testListings = [
        { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: true },
        { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
    ]
    const { user } = useContext(userContext)
    const [soldListings, setSoldListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        setIsLoading(true)
        try {
            // grab the users saved listings on component mount
            // for now is test listings
            setSoldListings(testListings)
        } catch (e) {
            setErrorMessage(e.message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    if (isLoading) {
        return <FullLoadingScreen />
    }

    if (!soldListings) {
        return (
            <View>
                <Text>
                    Your sold listings will appear here!
                </Text>
            </View>
        )
    }

    return (
        <ListingsList
            listings={soldListings}
            navigation={navigation}
        />
    )
}

export default SoldItems;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '90%',
        alignSelf: 'center'
    },
    text: {
        fontFamily: 'inter',
        fontSize: 24,
        fontWeight: '500',
        maxWidth: '75%',
        textAlign: 'center'
    }
})