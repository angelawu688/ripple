import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/ListingCard'
import { getFirestore, query, where, collection, getDocs, orderBy } from "firebase/firestore";


const SavedItems = ({ navigation }) => {
    // const testListings = [
    //     { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    //     { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
    // ]
    const { savedPosts } = useContext(userContext)
    const [savedListings, setSavedListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        try {
            // grab the users saved listings on component mount
            setSavedListings(savedPosts)
        } catch (error) {
            console.error("Error fetching saved posts", error)
        } finally {
            setIsLoading(false)
        }
    }, [savedPosts])

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
            data={savedListings}
            renderItem={({ item: listing }) => { // note: need to keep as "items", we are just renaming it to be clear
                if (!listing) {
                    console.log("Found an undefined listing in savedPosts.");
                    return null;
                }
                const listingID = listing.listing_id
                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ListingScreen', { listingID: listingID })}
                        style={{ width: '49.75%' }}
                    >
                        <ListingCard listing={listing} // pass in entire listing
                        // price={listing.price || "0"}
                        // title={listing.title || "na"}
                        // img={listing.img || undefined}
                        // sold={listing.sold !== undefined ? listing.sold : false}
                        />

                    </TouchableOpacity>
                )
            }}
            keyExtractor={listing => listing.id} // use the conversationID as a key

            // this is where we will put the handling to load more
            onEndReachedThreshold={null}
            onEndReached={null}

        />
    )
}

export default SavedItems;