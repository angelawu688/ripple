import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/ListingCard'
import {getFirestore, query, where, collection, getDocs } from "firebase/firestore";


const SavedItems = ({ navigation }) => {
    // const testPosts = [
    //     { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    //     { listingID: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
    //     { listingID: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
    //     { listingID: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: false },
    //     { listingID: 5, img: undefined, title: 'Catan Set', price: 10, sold: false },
    //     { listingID: 6, img: undefined, title: 'Catan Expansion Pack', price: 10, sold: false },
    //     { listingID: 7, img: undefined, title: 'Exploding Kittens', price: 40, sold: true },
    //     { listingID: 8, img: undefined, title: 'Macbook Pro', price: 100, sold: false },
    //     { listingID: 9, img: undefined, title: 'Comfy Couch', price: 40, sold: false },
    //     { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
    // ]

    // const testListings = [
    //     { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
    //     { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
    // ]

    const { user } = useContext(userContext);
    const [savedListings, setSavedListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(async () => {
        setIsLoading(true)
        try {
            const db = getFirestore();
            // grab the users saved listings on component mount
            const savedPostsRef = collection(db, "savedPosts");
            const queryPosts = query(savedPostsRef, where("user_id", "==", user.uid));
            const querySnapshot = await getDocs(queryPosts);
            const posts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSavedListings(posts);
            console.log("Saved Listings", posts);
        } catch (error) {
            console.log(error.message)
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
            data={savedListings}
            // TODO: does this look at each document?
            renderItem={({ item: listing }) => { // note: need to keep as "items", we are just renaming it to be clear
                const listingID = listing.listing_id
                // const { price, title, } = listing;
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
            keyExtractor={listing => listing.listing_id} // use the conversationID as a key

            // this is where we will put the handling to load more
            onEndReachedThreshold={null}
            onEndReached={null}

        />
    )
}

export default SavedItems;