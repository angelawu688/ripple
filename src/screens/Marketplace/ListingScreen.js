import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, FlatList, Dimensions, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection, query, where } from "firebase/firestore";
import { useState, useEffect, useContext, useRef } from 'react';
import { userContext } from "../../context/UserContext";
import { colors } from '../../colors'
import { User, Storefront, PaperPlaneTilt, TrashSimple, PencilSimple } from 'phosphor-react-native';
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
    const [isSaved, setIsSaved] = useState(true);
    const { listingID } = route.params;
    const { user, userData } = useContext(userContext);
    const [isLoadingSave, setIsLoadingSave] = useState(false)
    const [editSelected, setEditSelected] = useState(true) // used for toggling bt edit and delete buttons
    const [postSold, setPostSold] = useState(false)


    const isOwnPost = true // TEST, GRAB ON COMPONENT MOUNT
    const otherUserID = 'TcxxqAtEwuPxzYLSoQdv12vWqp83';
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
                    // check if listing is saved already
                    const savedPostsRef = collection(db, "savedPosts");
                    const queryPosts = query(savedPostsRef,
                        where("user_id", "==", user.uid),
                        // this throws an error every time. Listing is undefined, thats why this runs
                        // this will never get the initial state
                        where("listing_id", "==", listing.listing_id)
                    );
                    try {
                        // since undefined up there, we get an empty snapshot down here every time
                        const savedSnapshot = await getDocs(queryPosts)
                        if (!savedSnapshot.empty) {
                            console.log("Listing is not saved by the user.");
                            setIsSaved(false);
                        } else {
                            console.log("Listing is  saved.");
                            setIsSaved(true);
                        }
                    } catch (error) {
                        console.error("Error checking if listing is saved:", error);
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
        return <ListingScreenFullSkeletonLoader />
    }

    if (isOwnPost) {
        // put three dots in the top right
    }

    if (!listing) {
        return <View style={styles.container}><Text>Listing not found</Text></View>;
    }

    const handleEditListing = () => {
        navigation.navigate('EditPost', { listing: listing })
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

    const deletePost = () => {
        console.log('DELETE POST')
        // handle backlend states, navigation, etc.
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
                        text: "Delete",
                        onPress: () => markAsSold(),
                        style: "destructive",
                    },
                ],
                { cancelable: true } // Allows dismissal by tapping outside the alert
            );
        }
    }

    const markAsSold = () => {
        setPostSold(!postSold)
    }



    const handleSavePost = async () => {
        // frontend change
        setIsSaved(!isSaved)
        setIsLoadingSave(true)

        if (!listing) {
            return;
        }

        // we probably should throttle this
        try {
            if (isSaved) {
                // add it
                await setDoc(doc(db, "savedPosts", user.uid + listing.listing_id), {
                    user_id: user.uid,
                    listing_id: listing.listing_id,
                    price: listing.price,
                    title: listing.title
                    // listing images requires firebase storage
                });
            } else {
                // delete it
                // what about the case where it isnt there???
                const listingRef = doc(db, "savedPosts", user.uid + listing.listing_id);

                // if (!listingRef) {
                //     // we dont
                //     return;
                // }
                await deleteDoc(listingRef)
            }
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoadingSave(false)
        }





        // This was the old version. Wouldnt allow for frontend updates and was broken
        // if (isSaved && listing) {
        //     // post should be in saved
        //     console.log('SAVE POST!')
        //     try {
        //         await setDoc(doc(db, "savedPosts", user.uid + listing.listing_id), {
        //             user_id: user.uid,
        //             listing_id: listing.listing_id,
        //             price: listing.price,
        //             title: listing.title
        //             // listing images requires firebase storage
        //         });
        //     } catch (error) {
        //         console.log(error.message);
        //     }
        // } else if (listing) {
        //     // remove post from saved
        //     const listingRef = doc(db, "savedPosts", user.uid + listing.listing_id);
        //     await deleteDoc(listingRef);
        //     console.log("deleted");
        // }
        // else {
        //     // should never hit this case
        //     setIsLoading(true);
        // }
        // no navigation
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
                    navigation.navigate('UserProfile', { userID: otherUserID })
                }}

                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>

                    {user?.pfp?.uri ? (
                        <Image
                            source={{ uri: user.pfp.uri }}
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
                            {userData.name || 'oops'}
                        </Text>
                        <Text style={{ fontFamily: 'inter', fontSize: 18, marginLeft: 8, color: colors.accentGray }} >
                            {user.email}
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

            {isOwnPost && <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '92%', alignSelf: 'center', height: 40, marginTop: 12 }}>
                <TouchableOpacity onPress={() => {
                    if (editSelected) {
                        handleEditListing()
                    } else {
                        setEditSelected(true)
                    }
                }}

                    style={[{ width: editSelected ? '70%' : '25%' }, styles.ownPostBottomButton]}>
                    {!editSelected ? (<PencilSimple color={colors.accentGray} />) : (<Text style={[styles.ownPostBottomButtonText, { color: colors.accentGray }]}>Edit Listing</Text>)}

                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    if (editSelected) {
                        setEditSelected(false)
                    } else {
                        handleDeleteListing()
                    }
                }}
                    style={[styles.ownPostBottomButton, { width: editSelected ? '25%' : '70%', borderColor: editSelected ? (colors.accentGray) : (colors.errorMessage) },]}>
                    {editSelected ? (<TrashSimple color={colors.errorMessage} />) : (<Text style={[styles.ownPostBottomButtonText, { color: colors.errorMessage }]}>Delete Listing</Text>)}


                </TouchableOpacity>
            </View>}

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
        height: '100%',
        borderColor: colors.accentGray,
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