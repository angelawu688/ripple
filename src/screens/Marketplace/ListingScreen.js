import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, FlatList, Dimensions, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    setDoc,
    collection,
    query,
    where,
    updateDoc
} from "firebase/firestore";
import { useState, useEffect, useContext, useRef } from 'react';
import { userContext } from "../../context/UserContext";
import { colors } from '../../colors'
import { User, Storefront, PaperPlaneTilt, TrashSimple, PencilSimple, Package } from 'phosphor-react-native';
import { LocalRouteParamsContext } from 'expo-router/build/Route';
import ListingScreenFullSkeletonLoader from '../../components/ListingScreenFullSkeletonLoader'


const ListingScreen = ({ navigation, route }) => {
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
    const { user, savedPosts, setSavedPosts, setUserListings } = useContext(userContext);
    const [isLoadingSave, setIsLoadingSave] = useState(false)
    // edit, delete, markSold | used for toggling buttons
    const [selectedBottomButton, setSelectedBottomButton] = useState('markSold')
    const [postSold, setPostSold] = useState(false) // grab this on init
    const [isOwnPost, setIsOwnPost] = useState(false) // grab this on init
    const [sellerID, setSellerID] = useState(null) // grab this on init


    // const isOwnPost = true // TEST, GRAB ON COMPONENT MOUNT
    // const otherUserID = 'TcxxqAtEwuPxzYLSoQdv12vWqp83';
    const testPhotos = [
        { id: '1', color: 'yellow' },
        { id: '2', color: 'green' },
        { id: '3', color: 'red' },
        { id: '4', color: 'purple' },
        { id: '5', color: 'blue' },
    ]

    const db = getFirestore();
    useEffect(() => {
        const fetchListing = async () => {
            setIsLoading(true)
            try {
                const docRef = doc(db, "listings", listingID);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setListing({ id: docSnap.id, ...docSnap.data() });
                    // check if it's their own post, can save their own posts
                    if (docSnap.data().userId === user.uid) {
                        setIsOwnPost(true);
                        setSellerID(user.uid);
                    }
                    else {
                        setIsOwnPost(false);
                        setSellerID(docSnap.data().userId);
                    }

                    // check if it's sold or not
                    if (docSnap.data().sold === true) {
                        console.log(`Listing is sold`);
                        setPostSold(true);
                    }
                    else {
                        console.log(`Listing is not sold`);
                        setPostSold(false);
                    }

                    // check if listing is saved already
                    if (savedPosts && savedPosts.length !== 0) {
                        const saveStatus = savedPosts.some((post) => post.listing_id === listingID && post.userID === user.uid);
                        if (saveStatus) {
                            setIsSaved(true);
                            console.log(`Listing with ID ${listingID} is saved.`);
                        } else {
                            setIsSaved(false)
                            console.log(`Listing with ID ${listingID} is not saved.`);
                        }
                    }
                    else {
                        setIsSaved(false);
                    }

                } else {
                    console.log("No such listing!");
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
        return <ListingScreenFullSkeletonLoader />
    }

    if (isOwnPost) {
        // put three dots in the top right
    }

    if (!listing) {
        return <View style={styles.container}><Text>Listing not found</Text></View>;
    }

    const handleEditListing = () => {
        navigation.navigate('EditPost', { listing: listing, listingID: listingID })
    }

    const handleDeleteListing = () => {
        Alert.alert(
            "Are you sure?",
            "You can't undelete a post",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel", // Makes the "Cancel" button bold on iOS
                },
                {
                    text: "Delete",
                    onPress: () => deletePost(),
                    style: "destructive", // makes it red
                },
            ],
            { cancelable: true } // Allows dismissal by tapping outside the alert
        );
    }

    // should only be available if it's their own listing
    const deletePost = async () => {
        console.log('DELETE POST')
        // handle backend states, navigation, etc.
        // TODO:
        // delete from listings, delete from savedPosts
        // display "post is no longer available"? if someone's viewing post at same time
        const docRef = doc(db, "listings", listingID);
        try {
            await deleteDoc(docRef);
            // frontend update
            setUserListings((prevUserListings) =>
                prevUserListings.filter((post) => post.id !== listingID)
            );
        } catch (error) {
            console.error("Error deleting listing:", error);
        } finally {
            console.log("listing is deleted")
        }
    }

    const handleMarkAsSold = () => {
        if (postSold) {
            Alert.alert(
                "Are you sure?",
                "This will mark your post as active to other users",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    {
                        text: "Mark as Active",
                        onPress: () => markAsActive(),
                        style: "destructive",
                    },
                ],
                { cancelable: true } // Allows dismissal by tapping outside the alert
            );
        } else {
            markAsSold();
            setPostSold(!postSold)
        }
    }

    const markAsSold = async () => {
        console.log('marking post as sold')
        const docRef = doc(db, "listings", listingID);
        const updatedData = {sold: true};
        try {
            await updateDoc(docRef, updatedData);
        } catch (error) {
            console.error("Error marking listing as sold:", error);
        } finally {
            setPostSold(!postSold)
            console.log("listing is now marked as sold")
            setUserListings(prevUserListings =>
                prevUserListings.map(listing =>
                    listing.id === listingID ? { ...listing, ...updatedData } : listing
                )
            );
        }
    }

    const markAsActive = async () => {
        console.log('marking post as active')
        const docRef = doc(db, "listings", listingID);
        const updatedData = { sold: false }
        try {
            await updateDoc(docRef, updatedData);
        } catch (error) {
            console.error("Error marking listing as active:", error);
        } finally {
            setPostSold(!postSold)
            console.log("listing is now marked as active")
            setUserListings(prevUserListings =>
                prevUserListings.map(listing =>
                    listing.id === listingID ? { ...listing, ...updatedData } : listing
                )
            );
        }
    }



    const handleSavePost = async () => {
        // frontend change
        setIsLoadingSave(true)

        if (!listing) {
            return;
        }

        // TODO :
        // we probably should throttle this
        try {
            if (!isSaved) {
                // add it
                await setDoc(doc(db, "savedPosts", user.uid + listingID), {
                    userID: user.uid,
                    listing_id: listingID,
                    price: listing.price,
                    title: listing.title
                    // listing images requires firebase storage
                });
                const newSaved = {
                    userID: user.uid,
                    listing_id: listingID,
                    price: listing.price,
                    title: listing.title,
                };
                // TODO:
                // frontend update, can discuss this
                setSavedPosts((prevSavedPosts) => [...prevSavedPosts, newSaved]);
            }
            else {
                // TODO:
                // can also directly query the savedPosts collection to check
                const listingRef = doc(db, "savedPosts", user.uid + listingID);
                if (savedPosts && savedPosts.length !== 0) {
                    const saveStatus = savedPosts.some((post) => post.listing_id === listingID && post.userID === user.uid);
                    if (saveStatus) {
                        await deleteDoc(listingRef);
                    } else {
                        console.error("no document to delete");
                    }
                }
                else {
                    console.error("no document to delete");
                }
                // TODO:
                // frontend update, can discuss this
                setSavedPosts((prevSavedPosts) =>
                    prevSavedPosts.filter((post) => post.listing_id !== listingID || user.uid !== post.userID)
                );
                // delete it
                // const listingRef = doc(db, "savedPosts", user.uid + listing.listing_id);
                // const savedPostsRef = collection(db, "savedPosts");
                // const queryPosts = query(savedPostsRef,
                //     where("user_id", "==", user.uid),
                //     where("listing_id", "==", listingID)
                // );
                // try {
                //     const savedSnapshot = await getDocs(queryPosts)
                //     if (savedSnapshot.exists()) {
                //         console.log("Listing is in savedPosts, listing.listing_id is: ");
                //         await deleteDoc(listingRef);
                //     } else {
                //         console.log("Listing is not saved.");
                //     }
                // } catch (error) {
                //     console.error("Error checking if listing is saved:", error);
                // }
            }
            setIsSaved(!isSaved);
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoadingSave(false)
        }
    }

    const handleSendHi = () => {
        // TODO
        // conditionally create a new conversation on the backend and frontend
        // loading states, etc. 

        // this will navigate with the 
        navigation.navigate('MessagesStack', {
            screen: 'Conversation',
            params: { listing },
        });
        console.log('SEND HI')
    }

    const sharePost = () => {
        // will have to flesh out what this looks like, thinking like a pop up to send as a text?
    }

    return (
        <ScrollView
            contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
            style={{ width: '100%' }}

        >
            <PhotoCarousel photos={testPhotos} />

            {/* name, price, date */}
            <View style={styles.sectionContainer}>
                <View style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                    <Text numberOfLines={1}
                        style={{ fontFamily: 'inter', fontWeight: '600', fontSize: 22, marginTop: 0 }}>
                        {listing.title}
                    </Text>
                    <Text style={{ fontSize: 22, fontFamily: 'inter', marginTop: 0, fontWeight: '500', color: colors.loginBlue }}>
                        ${listing.price}
                    </Text>
                </View>
                {/* todofix */}
                <Text style={{ fontFamily: 'inter', fontSize: 16, fontWeight: '400', color: colors.accentGray }}>
                    {new Date(listing.createdAt.toDate()).toLocaleDateString()}
                </Text>
            </View>

            {/* profile card */}
            <View style={styles.sectionContainer}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate('UserProfile', { userID: sellerID })
                }}

                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>

                    {listing?.pfp?.uri ? (
                        <Image
                            source={{ uri: listing.pfp.uri }}
                            style={{ width: 60, height: 60, borderRadius: 60 }}
                        />
                    ) : (
                        <View
                            style={{ height: 60, width: 60, borderRadius: 60, backgroundColor: colors.loginGray, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <User color='black' size={32} />
                        </View>
                    )}

                    <View>
                        <Text style={{ fontFamily: 'inter', fontSize: 18, marginLeft: 8, color: 'black', fontWeight: '500' }} >
                            {listing.userName || 'no name available'}
                        </Text>
                        <Text style={{ fontFamily: 'inter', fontSize: 18, marginLeft: 8, color: colors.accentGray }} >
                            {listing.userEmail || 'no email available'}
                        </Text>
                    </View>

                </TouchableOpacity>
            </View>


            {/* IF THIS IS NOT OUR POST */}
            {/* prompt section */}
            {!isOwnPost && <View style={styles.sectionContainer}>
                <TouchableOpacity onPress={() => handleSendHi()}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', height: 45, borderWidth: 1, borderColor: '#F2F0F0', paddingHorizontal: 12, borderRadius: 13 }}>
                    <View style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', }}>
                        <Storefront color='black' size={28} />
                        <Text style={{ marginLeft: 20, fontFamily: 'inter', fontSize: 18 }}>
                            "Hi, is this still available?"
                        </Text>
                    </View>

                    <View
                        style={[{ height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 13, backgroundColor: colors.neonBlue, paddingHorizontal: 10 }, styles.shadow]}
                    >
                        <Text style={{ fontSize: 14, fontFamily: 'inter', fontWeight: '600', color: "white" }}>Send</Text>
                    </View>

                </TouchableOpacity>

                <View style={styles.bottomButtonContainer}>

                    <TouchableOpacity style={styles.bottomButton} onPress={() => console.log('share')}>
                        <PaperPlaneTilt size={26} color="black" s />
                        <Text style={{ marginLeft: 12, fontFamily: 'inter', fontSize: 18 }}>
                            Share
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleSavePost()}
                        style={styles.bottomButton}
                    >
                        {isSaved ? (
                            <Ionicons name="bookmark" size={24} color="#000" />
                        ) : (
                            <Ionicons name="bookmark-outline" size={24} color="#000" />
                        )}
                        <Text style={{ marginLeft: 12, fontFamily: 'inter', fontSize: 18 }}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>}

            {isOwnPost &&
                <View style={styles.sectionContainer}>
                    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', alignSelf: 'center', height: 40, marginTop: 12 }}>

                        <TouchableOpacity onPress={() => {
                            if (selectedBottomButton === 'markSold') {
                                handleMarkAsSold()
                            } else {
                                setSelectedBottomButton('markSold')
                            }
                        }}
                            style={[{ width: selectedBottomButton === 'markSold' ? '50%' : '20%' }, styles.ownPostBottomButton]}>
                            {selectedBottomButton !== 'markSold' ? (<Package color={colors.black} />) : (<Text style={[styles.ownPostBottomButtonText, { color: colors.black }]}> Mark as {postSold ? 'Active' : 'Sold'}</Text>)}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            if (selectedBottomButton === 'edit') {
                                handleEditListing()
                            } else {
                                setSelectedBottomButton('edit')
                            }
                        }}
                            style={[{ width: selectedBottomButton === 'edit' ? '50%' : '20%' }, styles.ownPostBottomButton]}>
                            {selectedBottomButton !== 'edit' ? (<PencilSimple color={colors.accentGray} />) : (<Text style={[styles.ownPostBottomButtonText, { color: colors.accentGray }]}>Edit Listing</Text>)}

                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            if (selectedBottomButton !== 'delete') {
                                setSelectedBottomButton('delete')
                            } else {
                                handleDeleteListing()
                            }
                        }}
                            style={[styles.ownPostBottomButton, { width: selectedBottomButton === 'delete' ? '50%' : '20%', borderColor: selectedBottomButton !== 'delete' ? (colors.accentGray) : (colors.errorMessage) },]}>
                            {selectedBottomButton !== 'delete' ? (<TrashSimple color={colors.errorMessage} />) : (<Text style={[styles.ownPostBottomButtonText, { color: colors.errorMessage }]}>Delete Listing</Text>)}
                        </TouchableOpacity>
                    </View>
                </View>

            }

            {/* description section */}
            <View style={styles.sectionContainer}>
                <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '500', marginBottom: 4, marginTop: 16 }}>
                    Description
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                    {listing.description}
                </Text>
            </View>

        </ScrollView >
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
    priceNameContainer: {
        alignSelf: 'center',
        width: '95%',
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    sectionContainer: {
        width: '92%',
        alignSelf: 'center',
        flexDirection: 'column',
        marginTop: 16

    },
    bottomButton: {
        display: 'flex',
        width: '47%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderWidth: 1,
        borderColor: '#F2F0F0',
        borderRadius: 13,
        paddingHorizontal: 4,

    },
    bottomButtonContainer: {
        width: '100%',
        display: 'flex', justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        marginTop: 12,
    },
    ownPostBottomButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.accentGray,
        height: 40,
        borderRadius: 8
    },
    ownPostBottomButtonText: { fontSize: 18, fontFamily: 'inter', fontWeight: '600' }
})


const PhotoCarousel = ({ photos }) => {
    const { width } = Dimensions.get("window");
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    // styles up top to allow this to be moved if needed
    const carouselStyles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
        },
        imageContainer: {
            width: width,
            height: width,
            borderRadius: 10,
            alignSelf: "center",
        },
        indicatorContainer: {
            position: "absolute",
            bottom: 35,
            flexDirection: "row",
            justifyContent: "center",
            alignSelf: "center",
        },
        indicatorButton: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.loginGray,
            marginHorizontal: 8,
        },
        activeIndicator: {
            backgroundColor: colors.neonBlue,
            width: 10 // can make this bigger if you want
        },

    })


    const handleScroll = (event) => {
        // basically round into the nearest box
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const navigateToIndex = (index) => {
        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
        });
        setCurrentIndex(index);
    };

    return (
        <View style={carouselStyles.container} >
            <FlatList
                pagingEnabled
                ref={flatListRef}
                horizontal={true}
                data={photos}
                renderItem={(item) => {
                    return (
                        // TODO change this to be an image
                        <View style={{ height: width, width: width, backgroundColor: item.item.color, alignSelf: 'center' }} />
                    )
                }}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll} // manage state variable
                scrollEventThrottle={16} // slows down the rate of the event handler
            />
            <View style={carouselStyles.indicatorContainer}>
                {photos.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => navigateToIndex(index)}
                        style={[
                            carouselStyles.indicatorButton,
                            currentIndex === index && carouselStyles.activeIndicator
                        ]}

                    />
                ))}
            </View>
        </View >
    )
}