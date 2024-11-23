import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import {getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection, query, where} from "firebase/firestore";
import {useState, useEffect, useContext} from 'react';
import {userContext} from "../../context/UserContext";


const ListingScreen = ({ route }) => {
    const [width, setWidth] = useState(0);
    const handleLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
    };
    const [listing, setListing] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // when you onboard, need to know if listing is saved or not by the user
    const [isSaved, setIsSaved] = useState(false);
    const { listingID } = route.params;
    const { user, savedPosts, setSavedPosts } = useContext(userContext);

    const db = getFirestore();
    useEffect(() => {
        const fetchListing = async () => {
          try {
            const docRef = doc(db, "listings", listingID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setListing({ id: docSnap.id, ...docSnap.data() });
                // check if listing is saved already
                if (savedPosts !== undefined && savedPosts.length !== 0 && savedPosts.some((post) => post.listing_id === listingID)) {
                    console.log("Listing is saved by the user.");
                    setIsSaved(true);
                }
                else {
                    console.log("Listing is not saved.");
                    setIsSaved(false);
                }
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching listing:", error);
          } finally {
            setIsLoading(false);
          }
        };
    
        fetchListing();
      }, [listingID]);
      if (isLoading) {
        return <View style={styles.container}><Text>Loading...</Text></View>;
      }
    
      if (!listing) {
        return <View style={styles.container}><Text>Listing not found</Text></View>;
      }


    const handleSavePost = async () => {
        console.log("isSaved before is ", isSaved)
          if (isSaved) {
              setIsSaved(false);
          }
          else {
              setIsSaved(true);
          }
        // TODO: fix this toggle
        // setIsSaved(!isSaved) // toggle
        console.log("isSaved is now", isSaved)
        console.log("savedPosts is ", savedPosts)
        // BACKEND LOGIC HERE
        if (isSaved && listing) {
            // post should be in saved
            console.log('SAVE POST!')
            try {
                const newSaved = await setDoc(doc(db, "savedPosts", user.uid + listingID), {
                    user_id: user.uid,
                    listing_id: listingID,
                    price: listing.price,
                    title: listing.title
                    // listing images requires firebase storage
                });
                // do i need to update context here
                setSavedPosts((prevSavedPosts) => [...prevSavedPosts, newSaved]);
                console.log("savedPosts is ", savedPosts)
            } catch (error) {
                console.log(error.message);
            }
        } else if (!isSaved && listing) {
            // remove post from saved
            const listingRef = doc(db, "savedPosts", user.uid + listingID);
            await deleteDoc(listingRef);
            setSavedPosts((prevSavedPosts) => prevSavedPosts.filter((post) => post.listing_id !== listingID));
            console.log("deleted");
        }
        else {
            // should never hit this case
            setIsLoading(true);
        }
        // no navigation
    }

    const handleSendHi = () => {
        console.log('SEND HI')
        // navigate to where the message will be sent
    }

    const sharePost = () => {
        // will have to flesh out what this looks like, thinking like a pop up to send as a text?
    }
    


    return (
        <ScrollView
            onLayout={handleLayout}
            contentContainerStyle={{ alignItems: 'center' }}
            style={{ flex: 1, width: '100%' }}
        >
            {/* BIG PHOTO */}
            <View style={{ height: width - 8, width: width - 8, backgroundColor: 'yellow', borderRadius: 10, alignSelf: 'center' }}>

            </View>

            <View style={{ width: '92%', alignSelf: 'center', marginTop: 4 }}>
                <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', marginTop: 6, }}>
                    <Text numberOfLines={1}
                        style={{ fontFamily: 'inter', fontWeight: '600', fontSize: 22, marginTop: 0 }}>
                        {listing.title}
                    </Text>
                    <Text style={{ fontSize: 18, fontFamily: 'inter', marginTop: 0, fontWeight: '500' }}>
                        ${listing.price}
                    </Text>
                </View>
                <Text style={{ fontFamily: 'inter', fontSize: 14, color: '#767676', marginBottom: 10 }}>
                    {new Date(listing.createdAt.toDate()).toLocaleDateString()}
                </Text>


                <TouchableOpacity style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center', height: 45, paddingHorizontal: 12, marginBottom: 12 }}>

                    
                    <Text style={{ fontFamily: 'inter', fontSize: 16, marginLeft: 12 }}>
                        FIRST LAST
                    </Text>



                </TouchableOpacity>

                <TouchableOpacity style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', height: 45, borderWidth: 1, borderColor: '#F2F0F0', paddingHorizontal: 12, borderRadius: 13 }}>
                    <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', }}>
                        <Ionicons name="business-outline" size={24} color="#000" />
                        <Text style={{ marginLeft: 20, fontFamily: 'inter', fontSize: 18 }}>
                            "Hi, is this still available?"
                        </Text>
                    </View>

                    <View
                        style={[{ height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 13, backgroundColor: 'white', paddingHorizontal: 10 }, styles.shadow]}
                    >
                        <Text style={{ fontSize: 14, fontFamily: 'inter' }}>Send</Text>
                    </View>

                </TouchableOpacity>


                <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', height: 45, marginTop: 14 }}>

                    <TouchableOpacity style={{ width: '48%', display: 'flex', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', height: 45, borderWidth: 1, borderColor: '#F2F0F0', borderRadius: 13, paddingHorizontal: 4 }}>
                        <Ionicons name="mail-outline" size={24} color="#000" />
                        <Text style={{ marginLeft: 20, fontFamily: 'inter', fontSize: 18 }}>
                            Share
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleSavePost()}
                        style={{ width: '48%', display: 'flex', justifyContent: 'center', flexDirection: 'row', alignItems: 'center', height: 45, borderWidth: 1, borderColor: '#F2F0F0', borderRadius: 13, paddingHorizontal: 4 }}>
                        <Ionicons name="bookmark-outline" size={24} color="#000" />
                        <Text style={{ marginLeft: 12, fontFamily: 'inter', fontSize: 18 }}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>


                <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '500', marginBottom: 4, marginTop: 16 }}>
                    Description
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                    {listing.description}
                </Text>




            </View>
        </ScrollView>
    )
}

export default ListingScreen;


const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
})