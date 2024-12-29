import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native'
import { X } from 'phosphor-react-native';
import { colors } from '../../constants/colors'
import ListingCard from '../listings/ListingCard';
import { getListingFromID } from '../../utils/firebaseUtils';


export const MessageBubble = ({ navigation, message, activeUserID, formattedDate = undefined }) => {
    if (!message) {
        return null
    }
    const { textContent, imageUri, postID, sentBy } = message
    const [listing, setListing] = useState(undefined)
    const [showZoomModal, setShowZoomModal] = useState(false)
    const isCurrentUser = sentBy === activeUserID

    useEffect(() => {
        const fetchListing = async () => {
            if (!postID) return;
            const fetchedListing = await getListingFromID(postID)
            if (!fetchedListing) {
                return
            }
            setListing(fetchedListing)
        }
        fetchListing()
    }, [postID])

    // if nothing then return 
    if (!textContent && !imageUri && !postID) {
        return;
    }

    return (
        <View style={{ flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start', marginVertical: 2 }}>
            {formattedDate && (
                <View style={{
                    width: '100%', display: 'flex', alignContent: 'center', justifyContent: 'center', marginBottom: 12, marginTop: 10

                }}
                >
                    <Text style={{ fontSize: 14, color: colors.accentGray, textAlign: 'center' }}>
                        {formattedDate}
                    </Text>
                </View>

            )}

            {listing && (
                <TouchableOpacity
                    onPress={() => navigation.navigate('ListingScreen', { listingID: listing.id })}

                    style={{
                        width: 150,
                        height: 170,
                        marginVertical: 12,
                    }}>
                    <ListingCard listing={listing} containerWidth={170} />
                </TouchableOpacity>
            )}

            {postID && !listing && (
                <View style={{ marginVertical: 4 }}>
                    <View style={{ backgroundColor: colors.loginGray, width: 150, height: 150, borderRadius: 12 }} />
                    <View style={{ marginTop: 4, backgroundColor: colors.loginGray, width: 150, height: 30, borderRadius: 12 }} />
                </View>
            )}

            {/* {imageUri && (
                <Image
                    style={{
                        width: 170,
                        height: 170,
                        // borderWidth: 1,
                        borderColor: colors.loginGray,
                        borderRadius: 8
                    }}
                    resizeMode='contain'
                    source={{ uri: imageUri }}
                />
            )} */}

            {imageUri && (
                <TouchableOpacity onPress={() => {
                    setShowZoomModal(true)
                }}>
                    <Image
                        source={{ uri: imageUri }}
                        style={[
                            {
                                width: 170,
                                height: 170,
                                borderRadius: 8,
                                borderWidth: 0.5,
                                borderColor: colors.loginGray,
                                backgroundColor: colors.loginGray,
                                marginBottom: 4
                            },
                            // styles.messageImage,
                            // isCurrentUser ? styles.sentImage : styles.receivedImage
                        ]}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            )}

            {textContent && textContent.length !== 0 && (
                <View style={[styles.messageBubble, isCurrentUser ? styles.sent : styles.received]}>

                    <Text style={[styles.messageText, { color: isCurrentUser ? 'white' : 'black' }]}>
                        {textContent}
                    </Text>
                </View>
            )}

            <Modal
                visible={showZoomModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowZoomModal(false)}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowZoomModal(false)}
                >
                    <X size={32} color='white' weight='bold' />
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setShowZoomModal(false)}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.fullScreenImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 12,
        padding: 10,
        marginVertical: 0,
        alignSelf: 'flex-start'
    },
    sent: {
        // backgroundColor: '#007aff',
        backgroundColor: colors.loginBlue,
        alignSelf: 'flex-end',
    },
    received: {
        backgroundColor: '#e5e5ea',
    },
    messageText: {
        fontFamily: 'inter',
        fontSize: 16,
        fontWeight: '400'
    },

    // modal styles: 
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black'
    },
    closeButtonText: {
        fontSize: 30,
        color: colors.white,
        fontWeight: 'bold',
    },
    zoomContainer: {
        width: '100%',
        height: '100%',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 9999,
        padding: 10,
    },
})