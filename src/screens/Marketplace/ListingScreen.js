import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions, Alert, Modal, Pressable, TouchableWithoutFeedback } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
    getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection, query, where, updateDoc
} from "firebase/firestore";

import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { userContext } from "../../context/UserContext";
import { colors } from '../../colors'
import { User, Storefront, PaperPlaneTilt, TrashSimple, PencilSimple, Package, Tag, SmileySad } from 'phosphor-react-native';
import { LocalRouteParamsContext } from 'expo-router/build/Route';
import ListingScreenFullSkeletonLoader from '../../components/ListingScreenFullSkeletonLoader'
import * as Linking from 'expo-linking'
import { formatDate } from '../../utils/formatDate'
import { useFocusEffect } from '@react-navigation/native';
import { deleteFromSavedPosts, deleteImages, getConversation } from '../../utils/firebaseUtils';



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
    const { listingID, } = route.params;
    const { user, savedPosts, setSavedPosts, setUserListings } = useContext(userContext);
    const [isLoadingSave, setIsLoadingSave] = useState(false)
    // edit, delete, markSold | used for toggling buttons
    const [selectedBottomButton, setSelectedBottomButton] = useState('markSold')

    const [postSold, setPostSold] = useState(false) // grab this on init
    const [isOwnPost, setIsOwnPost] = useState(false) // grab this on init. Literally something like uid === userData.uid should be chill
    const [sellerID, setSellerID] = useState(null) // grab this on init


    // 3 dots 
    const [modalVisible, setModalVisible] = useState(false)
    const toggleModal = () => {
        console.log('wahaawe')
        setModalVisible(!modalVisible);
    };

    // pass in the toggle modal function
    useEffect(() => {
        navigation.setParams({ toggleModal });
    }, [modalVisible]);

    const db = getFirestore();

    // fetches a listing from the DB
    const fetchListing = async () => {
        setIsLoading(true)
        try {
            const docRef = doc(db, "listings", listingID);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                setListing({ id: docSnap.id, ...data });
                // check if it's their own post, can save their own posts
                if (data.userId === user.uid) {
                    setIsOwnPost(true);
                    setSellerID(user.uid);
                }
                else {
                    setIsOwnPost(false);
                    setSellerID(data.userId);
                }

                setPostSold(!!data.sold)

                const alreadySaved = savedPosts?.some(
                    (post) => post.listing_id === listingID && post.userID === user.uid
                )
                setIsSaved(!!alreadySaved)

            } else {
                console.log("No such listing!");
            }
        } catch (error) {
            console.log("Error fetching listing:", error);
            // could we use toasts here?
        } finally {
            setIsLoading(false);
        }
    };


    // this is what makes it immediately responsive after we edit and go back
    // essentially the same as useEffect, but will do it every time we focus, not just the first time
    // the component mounts
    useFocusEffect(
        useCallback(() => {
            fetchListing();

            // might be a good idea for a cleanup function this is a placeholder
            // i.e. use some sort of ref to tell fetchListing to not grab data if we close the screen
            // before we get the data from fetch
            // not doing rn, premature optimization
            return () => { };
        }, [listingID, user.uid])
    );


    if (isLoading) {
        return <ListingScreenFullSkeletonLoader />
    }

    if (isOwnPost) {
        // put three dots in the top right
    }

    if (!listing) {
        return <View style={styles.container}>
            <SmileySad size={100} />
            <Text style={{ fontSize: 18, fontWeight: '600', fontFamily: 'inter', marginTop: 4, marginBottom: 2 }}>
                Oops! We couldn't find that listing
            </Text>
            <Text style={{ fontFamily: 'inter', }}>
                It may have been deleted, please refresh your page
            </Text>
        </View>;
    } else {
    }

    const handleEditListing = () => {
        navigation.navigate('EditPost', { listing: listing, listingID: listingID })
    }


    const handleReportUser = () => {
        console.log('reporting user')
        try {

        } catch (e) {

        } finally {

        }
        // set some sort of toast or something
        setModalVisible(false)
    }

    const handleDeleteListing = () => {
        Alert.alert(
            "Are you sure?",
            "You can't undelete a post",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                },
                {
                    text: "Delete",
                    onPress: () => {
                        deleteListing();
                        setModalVisible(false)
                    },
                    style: "destructive", // makes it red
                },
            ],
            { cancelable: true }
        );

    }

    const handleShareListing = () => {
        shareListing()
        setModalVisible(false)
    }

    const deleteListing = async () => {
        console.log('DELETE POST')
        const docRef = doc(db, "listings", listingID);
        try {
            if (listing.photos && listing.photos.length > 0) {
                await deleteImages(listing.photos)
            }
            await deleteFromSavedPosts(listingID)
            await deleteDoc(docRef);
            // frontend update
            setUserListings((prevUserListings) =>
                prevUserListings.filter((post) => post.id !== listingID)
            );
            navigation.goBack();
            // toast "post deleted successfully"
        } catch (error) {
            console.error("Error deleting listing:", error);
            // toast the error
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
                { cancelable: true } // can outside to cancel
            );
        } else {
            markAsSold();
            // TODO: is this necessary here? i feel like no
            setPostSold(!postSold)
        }
    }

    const markAsSold = async () => {
        const docRef = doc(db, "listings", listingID);
        const updatedData = { sold: true };
        try {
            await updateDoc(docRef, updatedData);
        } catch (error) {
            console.error("Error marking listing as sold:", error);
        } finally {
            setPostSold(!postSold)
            setUserListings(prevUserListings =>
                prevUserListings.map(listing =>
                    listing.id === listingID ? { ...listing, ...updatedData } : listing
                )
            );
        }
    }

    const markAsActive = async () => {
        const docRef = doc(db, "listings", listingID);
        const updatedData = { sold: false }
        try {
            await updateDoc(docRef, updatedData);
        } catch (error) {
            console.error("Error marking listing as active:", error);
        } finally {
            setPostSold(!postSold)
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

        try {
            const listingRef = doc(db, 'savedPosts', user.uid + listingID)
            if (!isSaved) {
                const newSaved = {
                    userID: user.uid,
                    listing_id: listingID,
                    price: listing.price,
                    title: listing.title,
                    photos: listing.photos
                };
                // add it
                await setDoc(listingRef, newSaved);

                setSavedPosts(prev => [...prev, newSaved])
                // setSavedPosts((prevSavedPosts) => [...prevSavedPosts, newSaved]);
            }
            else {
                // unsave the post
                await deleteDoc(listingRef)

                // filter it out from savedPosts
                setSavedPosts(prevSavedPosts =>
                    prevSavedPosts.filter(
                        (post) => !(post.listing_id === listingID && post.userID === user.uid)
                    )
                )
            }

            // toggle the value of saved
            setIsSaved(!isSaved);
        } catch (e) {
            console.log(e)
        } finally {
            setIsLoadingSave(false)
        }
    }

    const handleSendHi = async () => {
        if (!user.uid || !sellerID) {
            console.log('ids undefined')
            return
        }
        const conversationID = await getConversation(user.uid, sellerID)

        // this will navigate with the 
        navigation.navigate('MessagesStack', {
            screen: 'Conversation',
            params: { listing, conversationID },
        });
    }

    const shareListing = () => {
        // will have to flesh out what this looks like, thinking like a pop up to send as a text?
        const deepLink = Linking.createURL(`listing/${listingID}`)
        const messageBody = `Check out this listing on Ripple!\n${deepLink}`
        const smsURL = `sms:&body=${encodeURIComponent(messageBody)}`

        try {
            Linking.openURL(smsURL)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <ScrollView
            contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
            style={{ width: '100%', paddingBottom: 50 }}
        >
            <PhotoCarousel photos={listing.photos} sold={postSold} />


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
                {/* now showing date in own post per figma */}
                {(<Text style={{ fontFamily: 'inter', fontSize: 16, fontWeight: '400', color: colors.accentGray }}>
                    {/* {listing.createdAt.toDate().toLocaleDateString()} */}
                    {formatDate(listing.createdAt.seconds)}
                </Text>)}
            </View>

            {/* profile card */}
            {!isOwnPost && (<View style={styles.sectionContainer}>
                <TouchableOpacity onPress={() => {
                    navigation.navigate('UserProfile', { userID: sellerID })
                }}

                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>

                    {listing?.userPfp ? (
                        <Image
                            source={{ uri: listing.userPfp }}
                            // this will allow for use of qr codes and copy pasting text
                            enableLiveTextInteraction={true}
                            style={{ width: 40, height: 40, borderRadius: 60 }}
                        />
                    ) : (
                        <View
                            style={{ height: 40, width: 40, borderRadius: 60, backgroundColor: colors.loginGray, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            <User color='black' size={24} />
                        </View>
                    )}

                    <View>
                        <Text style={{ fontFamily: 'inter', fontSize: 18, marginLeft: 8, color: 'black', fontWeight: '500' }} >
                            {listing.userName || 'anonymous'}
                        </Text>
                        <Text style={{ fontFamily: 'inter', fontSize: 14, marginLeft: 8, color: colors.accentGray, fontWeight: '400' }} >
                            {listing.userEmail || 'mystery@uw.edu'}
                        </Text>
                    </View>

                </TouchableOpacity>
            </View>)}


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

                    <TouchableOpacity style={styles.bottomButton} onPress={() => shareListing()}>
                        <PaperPlaneTilt size={26} color="black" />
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


            {/* buttons if its your own */}
            {isOwnPost &&
                <View style={styles.isOwnPostContainer}>
                    <TouchableOpacity
                        onPress={() => handleEditListing()}
                        style={[{ width: '32%' }, styles.ownPostBottomButton]}
                    >
                        <PencilSimple color={colors.black} />
                        <Text style={styles.ownPostBottomButtonText}>
                            Edit
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleMarkAsSold()}
                        style={[{ width: '64%' }, styles.ownPostBottomButton]}

                    >
                        <Tag color={colors.black} />
                        <Text style={styles.ownPostBottomButtonText}>
                            Mark item as {postSold ? 'Active' : 'Sold'}
                        </Text>
                    </TouchableOpacity>
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

            <View style={{ width: 1, height: 20 }} />



            {/* MODAL VIEW */}
            {modalVisible && (
                <TouchableWithoutFeedback
                    style={styles.modalBackdrop}
                    onPress={() => {
                        console.log('dismiss')
                        setModalVisible(false)
                    } // Dismiss modal on backdrop press
                    }
                >
                    <View style={styles.modalContainer}>
                        {isOwnPost ? (
                            <>
                                <TouchableOpacity style={styles.modalOption} onPress={() => shareListing()}>
                                    <Text style={styles.modalText}>Share Post</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => handleDeleteListing()}>
                                    <Text style={[styles.modalText, { color: 'red' }]}>
                                        Delete Post
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => handleReportUser()}>
                                <Text style={[styles.modalText, { color: 'red' }]}>Report User</Text>
                            </TouchableOpacity>
                        )}
                        {/* <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.modalText, { color: 'black' }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity> */}
                    </View>
                </TouchableWithoutFeedback>
            )}
        </ScrollView>
    )
}

export default ListingScreen;


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
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
        width: '100%',
        paddingHorizontal: 15,
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
        borderColor: colors.loginGray,
        height: 40,
        borderRadius: 13,
        flexDirection: 'row'
    },
    ownPostBottomButtonText: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '400',
        marginLeft: 21
    },
    isOwnPostContainer: {
        width: '100%',
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25
    },
    // modal styles: 
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 99,
        flex: 1,
    },
    modalContainer: {
        position: 'absolute',
        top: 10, // Adjust to position the modal just below the header
        right: 10, // Align with the three dots
        width: 150,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        paddingVertical: 4,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.loginGray,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
    },
})


const PhotoCarousel = ({ photos, sold }) => {
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
            borderRadius: 0,
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
            width: 8,
            height: 8,
            borderRadius: 5,
            backgroundColor: colors.loginGray,
            marginHorizontal: 2,
        },
        activeIndicator: {
            backgroundColor: colors.neonBlue,
            width: 8 // can make this bigger if you want
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
                scrollEnabled={photos.length > 1} // wont scroll when only one photo
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                    return (
                        <View
                            style={{ height: width, width: width, alignSelf: 'center', justifyContent: 'center', }}
                        >
                            <Image
                                source={{ uri: item }}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 0,
                                }}
                                contentFit="cover"
                            />
                            {sold && (
                                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%' }}>
                                    <Text
                                        style={{
                                            color: 'white',
                                            fontSize: 100,
                                            fontWeight: '900',
                                            zIndex: 10,
                                            // top: '50%',
                                            // left: '50%',
                                            // transform: [{ translateX: -50 }, { translateY: -50 }],
                                        }}
                                    >
                                        SOLD
                                    </Text>
                                </View>
                            )}
                        </View>
                    )
                }
                } showsHorizontalScrollIndicator={false}
                onScroll={handleScroll} // manage state variable
                scrollEventThrottle={16} // slows down the rate of the event handler
            />
            {photos?.length > 1 && <View style={carouselStyles.indicatorContainer}>
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
            </View>}

        </View >
    )
}