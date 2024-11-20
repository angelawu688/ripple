import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { userContext } from '../../context/UserContext'
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { FlatList } from 'react-native'
import ListingCard from '../../components/ListingCard'
import { getFirestore, query, where, collection, getDocs } from "firebase/firestore";
import ListingsList from '../../components/ListingsList'


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

    const testListings = [
        { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
        { listingID: 10, img: undefined, title: 'Notebook', price: 2, sold: true },
    ]

    const { user } = useContext(userContext);
    const [savedListings, setSavedListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    // TODO OPTIMIZE
    // we shouldnt have to query the backend every time this component is opened––we should be able to cache this
    useEffect(() => {
        const fetchSavedListings = async () => {
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
        }
        fetchSavedListings();
    }, [])

    if (isLoading) {
        return <FullLoadingScreen />
    }

    if (!false) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                    Your saved listings will appear here!
                </Text>
            </View>
        )
    }

    return (
        <ListingsList
            listings={testListings}
            navigation={navigation}
        />
    )
}

export default SavedItems;

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