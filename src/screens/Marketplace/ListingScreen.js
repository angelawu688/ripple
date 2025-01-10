import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Dimensions, Alert, Modal, Pressable, TouchableWithoutFeedback } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
    getFirestore, doc, getDoc, getDocs, deleteDoc, setDoc, collection, query, where, updateDoc
} from "firebase/firestore";

import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { userContext } from "../../context/UserContext";
import { colors } from '../../constants/colors'
import { User, Storefront, PaperPlaneTilt, TrashSimple, PencilSimple, Package, Tag, SmileySad, DotsThree } from 'phosphor-react-native';
import { LocalRouteParamsContext } from 'expo-router/build/Route';
import * as Linking from 'expo-linking'
import { formatDate } from '../../utils/formatDate'
import { useFocusEffect } from '@react-navigation/native';
import { deleteFromSavedPosts, deleteImages, getConversation } from '../../utils/firebaseUtils';
import { db } from '../../../firebaseConfig';
import ReportListingModal from '../../components/ReportListingModal';
import ListingScreenFullSkeletonLoader from '../../components/listings/ListingScreenFullSkeletonLoader'
import { useListing } from '../../hooks/useListing';
import PhotoCarousel from '../../components/listingScreen/PhotoCarousel';
import ListingHeader from '../../components/listingScreen/ListingHeader';
import { ProfileCard } from '../../components/listingScreen/ProfileCard';
import { OtherUserButtons } from '../../components/listingScreen/OtherUserButtons';
import { OwnPostButtons } from '../../components/listingScreen/OwnPostButtons';
import { ThreeDotsListingModal } from '../../components/listingScreen/ThreeDotsListingModal';
import { ToastContext } from '../../context/ToastContext';



const ListingScreen = ({ navigation, route }) => {
    const { listingID, } = route.params;
    const {
        listing,
        isLoading,
        isSaved,
        postSold,
        isOwnPost,
        sellerID,
        fetchListing,
        handleSavePost,
        handleMarkAsSold,
        handleDeleteListing,
        handleShareListing,
        handleSendHi,
    } = useListing(listingID);
    const [reportModalVisible, setReportModalVisible] = useState(false) // report modal
    const [modalVisible, setModalVisible] = useState(false) // 3 dots modal

    const { showToast } = useContext(ToastContext)


    // 3 dots in the header
    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(prev => !prev)}>
                    <DotsThree size={32} />
                </TouchableOpacity>
            )
        });
    }, [navigation]);

    // // this is what makes it immediately responsive after we edit and go back
    // // essentially the same as useEffect, but will do it every time we focus, not just the first time
    // // the component mounts
    useFocusEffect(
        useCallback(() => {
            fetchListing();

            // might be a good idea for a cleanup function this is a placeholder
            // i.e. use some sort of ref to tell fetchListing to not grab data if we close the screen
            // before we get the data from fetch
            // not doing rn, premature optimization
            return () => { };
        }, [listingID])
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
    }

    const handleNavToMessages = async () => {
        const conversationDetails = await handleSendHi()
        if (conversationDetails) {
            navigation.navigate('MessagesStack', {
                screen: 'Conversation',
                params: {
                    listing,
                    ...conversationDetails
                },
            });
        }
    }


    return (
        <ScrollView
            contentContainerStyle={{ alignItems: 'center', flexGrow: 1 }}
            style={{ width: '100%', paddingBottom: 50 }}
        >
            <PhotoCarousel photos={listing.photos} sold={postSold} isOwnPost={isOwnPost} />

            <ListingHeader
                title={listing.title}
                price={listing.price}
            // createdAt={listing.createdAt}
            />

            {!isOwnPost && (
                <>
                    <ProfileCard
                        userPfp={listing?.userPfp}
                        userName={listing?.userName}
                        sellerID={sellerID}
                        createdAt={listing?.createdAt}
                        navigation={navigation}
                    />
                    <OtherUserButtons
                        isSaved={isSaved}
                        handleSendHi={handleNavToMessages}
                        handleSavePost={handleSavePost}
                        shareListing={handleShareListing}
                    />
                </>
            )}


            {isOwnPost &&
                <OwnPostButtons
                    handleEditListing={() => navigation.navigate('EditPost', { listing, listingID })}
                    handleMarkAsSold={handleMarkAsSold}
                    postSold={postSold}
                />

            }

            <View style={styles.sectionContainer}>
                <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '500', marginBottom: 4, marginTop: 16 }}>
                    Description
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                    {listing.description}
                </Text>
            </View>

            <View style={{ width: 1, height: 20 }} />


            <ThreeDotsListingModal
                visible={modalVisible}
                isOwnPost={isOwnPost}
                onShare={handleShareListing}
                onDelete={async () => {
                    const success = await handleDeleteListing();
                    if (success) {
                        navigation.goBack();
                        showToast('Post deleted!')
                        // refresh the listings here!!!!!
                    } else {
                        showToast('Error deleting post!')
                    }
                }}
                onReport={() => setReportModalVisible(true)}
                onClose={() => setModalVisible(false)}
            />

            <ReportListingModal
                visible={reportModalVisible}
                onClose={() => {
                    setReportModalVisible(false)
                    setModalVisible(false)
                }}
                userId={sellerID}
                listingID={listingID}
            />
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

})