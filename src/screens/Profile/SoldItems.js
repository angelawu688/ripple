

import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/ListingCard'

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
    return (
        <FlatList
            style={{ width: '99%', alignSelf: 'center' }}
            columnWrapperStyle={{
                justifyContent: 'space-between',
                marginTop: 0
            }}
            ListHeaderComponent={null} // blank for now, this is where a header would go.
            numColumns={2} // this is how we put them side by side
            data={soldListings}
            renderItem={({ item: listing }) => { // note: need to keep as "items", we are just renaming it to be clear
                const listingID = listing.listingID
                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ListingScreen', { listingID: listingID })}
                        style={{ width: '49.75%' }}
                    >
                        <ListingCard
                            price={listing.price}
                            title={listing.title}
                            img={listing.img}
                            sold={listing.sold}
                        />

                    </TouchableOpacity>
                )
            }}
            keyExtractor={listing => listing.listingID} // use the conversationID as a key

            // this is where we will put the handling to load more
            onEndReachedThreshold={null}
            onEndReached={null}

        />
    )
}

export default SoldItems;