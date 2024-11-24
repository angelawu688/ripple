import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/ListingCard'
import ListingsList from '../../components/ListingsList'

const YourListings = ({ navigation }) => {
    // const testListings = [
    //     { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    //     { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
    // ]
    const { userListings } = useContext(userContext)
    const [yourListings, setYourListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        try {
            // grab the users saved listings on component mount
            // for now is test listings
            setYourListings(userListings)
        } catch (error) {
            console.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }, [userListings])

    if (isLoading) {
        return <FullLoadingScreen />
    }

    if (!yourListings) {
        return (
            <View>
                <Text>
                    Your active listings will appear here!
                </Text>
            </View>
        )
    }


    return (
        <ListingsList
            navigation={navigation}
            listings={yourListings}
        />
    )
}

export default YourListings;

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