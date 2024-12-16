import { Ionicons } from '@expo/vector-icons'
import { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, FlatList, Keyboard, Modal } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import ListingCard from '../../components/ListingCard';
import { ArrowBendRightUp, CaretRight, User, X, XCircle } from 'phosphor-react-native';
import { colors } from '../../colors';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { getListingFromID, sendMessage } from '../../utils/firebaseUtils';
import { db } from '../../../firebaseConfig';
import { userContext } from '../../context/UserContext';
import { ZoomableView } from 'react-native-zoom-toolkit';
import { formatDate } from '../../utils/formatDate';




const MessageBubble = ({ navigation, message, activeUserID, formattedDate = undefined }) => {
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

    if (!textContent && !imageUri && !postID) {
        return;
    }



    // TODO make look cleaner
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
                    console.log('first')
                    setShowZoomModal(true)
                }}>
                    <Image
                        source={{ uri: imageUri }}
                        style={[
                            {
                                width: 170,
                                height: 170,
                                borderRadius: 8
                            },
                            // styles.messageImage,
                            isCurrentUser ? styles.sentImage : styles.receivedImage
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


const Conversation = ({ navigation, route }) => {
    // pass in the listing from the route
    const { listing, conversationID, otherUserDetails } = route.params

    const [inputListing, setInputListing] = useState(listing || null)
    const { user } = useContext(userContext)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState(listing ? ('Hi, is this still available?') : '')
    const [img, setImg] = useState(undefined)
    const [openingImagePicker, setOpeningImagePicker] = useState(false)
    const [inputHeight, setInputHeight] = useState(50)

    // auto-scroll to the bottom. Animated asf too 😮‍💨
    const scrollRef = useRef(null)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    useEffect(() => {
        console.log(otherUserDetails)
    }, [])

    // load messages from firebase
    useEffect(() => {
        const messagesRef = collection(db, 'conversations', conversationID, 'messages')

        // same as convs, we grab the snapshot and unsubscribe when we are done with it
        const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // most recent first, since we are using inverted flatlist
            setMessages(fetchedMessages.sort((a, b) => b.timestamp - a.timestamp));
        });

        // unsub on unmount
        return () => unsubscribe();
    }, [])

    useEffect(() => {
        console.log(otherUserDetails)
        navigation.setOptions({
            headerTitle: () => (
                <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userID: otherUserDetails.id })}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                >
                    {otherUserDetails?.pfp ? (
                        <Image
                            source={otherUserDetails.pfp}
                            style={{ borderRadius: 50, width: 35, height: 35, marginRight: 8 }}
                            resizeMethod='cover'
                        />
                    ) : (
                        <View
                            style={{ borderRadius: 50, width: 35, height: 35, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 8, backgroundColor: colors.loginGray }}
                        >
                            <User size={18} />
                        </View>
                    )}
                    <Text style={{ fontSize: 18, fontWeight: '500', fontFamily: 'inter', marginRight: 10 }}>
                        {otherUserDetails?.name}
                    </Text>
                    <CaretRight size={14} weight='bold' color={colors.accentGray} />


                </TouchableOpacity>
            )
        })
    }, [])

    const handleSendMessage = async (text, image, post, clearInputs) => {
        // if we arent sending anything, return
        if (!text.trim() && !image && !post) {
            return
        }

        // send it away to our lovely database
        try {
            // convID, senderID, textContent = undefined, postID = undefined, imageUri = undefined
            await sendMessage(
                conversationID,
                user.uid,
                text?.trim(),
                post?.id,
                img,
            )

        } catch (e) {
            console.log('handlesend', e)
        } finally {
            clearInputs();
        }
    }

    const clearInputs = () => {
        setInput('')
        setImg(null)
        setInputListing(null)
    }


    // opens the image picker and updates the selectedImage state 
    const handleAddImage = async () => {
        try {
            setOpeningImagePicker(true)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('We need camera roll permissions to add photos!');
                return;
            }

            // Launch image picker
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7,
                selectionLimit: 1
            });
            setOpeningImagePicker(false)

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => ({
                    uri: asset.uri,
                }));
                setImg(selectedImages[0].uri) // we are just storing images as URIs
            } else {
                // user cancelled, do nothing
            }
        } catch (e) {
            console.log('addimage', e);
            setOpeningImagePicker(false)
        }
    }


    return (
        <KeyboardAvoidingView // make sure that we can see input and keyboard
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
            onPress={() => Keyboard.dismiss()}
        >
            <View style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%', }}>
                {messages?.length > 0 ? (<FlatList
                    data={messages}
                    renderItem={({ item, index }) => {
                        const previousMessage = messages[index + 1];
                        let showDate = false;

                        if (!previousMessage) {
                            //    oldest message, so show the timestamp
                            showDate = true;
                        } else {
                            // compare to the previous message. If more than 30 min, then show timestamp
                            const currentTime = item.timestamp;
                            const prevTime = previousMessage.timestamp;
                            const diffInMinutes = Math.abs((prevTime - currentTime) / 60000);
                            if (diffInMinutes > 30) {
                                showDate = true;
                            }
                        }

                        // todo some sort of formatting. We only get a formatted date if we show the date
                        const formattedDate = showDate ? formatDate(item.timestamp / 1000) : null;

                        return (
                            <MessageBubble
                                navigation={navigation}
                                message={item}
                                activeUserID={user.uid}
                                formattedDate={formattedDate}
                            />
                        )
                    }
                    }
                    keyExtractor={(item) => item.id}
                    keyboardShouldPersistTaps='handled'
                    inverted={true}// This inverts the list
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 10,
                        paddingTop: 10,
                        paddingBottom: 50,
                    }}
                />) : (
                    <Text style={{ fontWeight: '500', fontFamily: 'inter', fontSize: 18 }}>
                        Start a conversation!
                    </Text>
                )}
                {/* preview for listing  */}
                {inputListing && (
                    <View style={styles.previewImageContainer}>
                        <View style={{ alignSelf: 'center', width: 150, height: 150, marginBottom: 45 }}>
                            <ListingCard listing={inputListing} />
                        </View>

                        <TouchableOpacity onPress={() => setInputListing(null)} style={styles.removePreviewButtonListing}>
                            <XCircle weight='fill' size={30} color={colors.loginGray} />

                        </TouchableOpacity>
                    </View>
                )}

                {/* Preview for Image */}
                {/* {img && (
                    <View style={styles.previewImageContainer}>
                        <Image source={{ uri: img }} style={styles.previewImage} />
                        <TouchableOpacity onPress={() => setImg(null)} style={styles.removePreviewButton}>
                            <XCircle weight='fill' size={30} color={colors.loginGray} />
                        </TouchableOpacity>
                    </View>
                )} */}

                {/* input bar at the bottom */}
                <View style={styles.inputBar}>
                    <TouchableOpacity onPress={() => handleAddImage()}
                        style={{
                            width: 35, height: 35, borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(0, 0, 0, 0.25)',
                            shadowOffset: { width: 5, height: 5 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            backgroundColor: 'white',
                            marginRight: 10,
                            alignSelf: 'flex-end',
                            marginBottom: 4

                        }}>
                        {openingImagePicker ? <ActivityIndicator color='#767676' /> : <Ionicons name='add-outline' size={20} color='#767676' />}
                    </TouchableOpacity>


                    <TextInput
                        placeholder='Message'
                        value={input}
                        onChangeText={setInput}
                        style={[styles.input, { height: inputHeight, textAlignVertical: 'top', }]}
                        onSubmitEditing={() => handleSendMessage(input, img, inputListing, clearInputs)}
                        multiline={true}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            const minHeight = 35;
                            const maxHeight = 100; // optional max
                            if (contentHeight < minHeight) {
                                setInputHeight(minHeight);
                            } else if (contentHeight > maxHeight) {
                                setInputHeight(maxHeight);
                            } else {
                                setInputHeight(contentHeight);
                            }
                        }}
                    />

                    <TouchableOpacity style={[styles.sendButton, { backgroundColor: input.trim() || img || inputListing ? colors.neonBlue : colors.loginGray }]} onPress={() => handleSendMessage(input, img, inputListing, clearInputs)}>
                        <ArrowBendRightUp size={20} color='white' />
                    </TouchableOpacity>

                </View>
            </View>
        </KeyboardAvoidingView >
    )
}

export default Conversation;


const styles = StyleSheet.create({
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 12,
        padding: 10,
        marginVertical: 0,
        alignSelf: 'flex-start'
    },
    sent: {
        backgroundColor: '#007aff',
        alignSelf: 'flex-end',
    },
    received: {
        backgroundColor: '#e5e5ea',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
        paddingTop: 5,
        marginBottom: 4
    },
    input: {
        height: 40,
        flex: 1,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    sendButton: {
        marginLeft: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#007aff',
        borderRadius: 20,
        alignSelf: 'flex-end'
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageText: {
        fontFamily: 'inter'
    },
    previewImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        width: 150,
        height: 150,
        alignSelf: 'flex-end',
        marginRight: 10
    },
    previewImage: {
        width: 150,
        height: 150,
        // borderRadius: 5,
        marginRight: 10,
        borderWidth: 1,
        borderColor: colors.loginGray,
        borderRadius: 8
    },
    previewPost: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        padding: 10,
        marginBottom: 5,

    },
    previewPostTitle: {
        fontWeight: 'bold',
        marginRight: 10,
    },
    previewPostDescription: {
        color: '#555',
    },
    removePreviewButton: {
        marginLeft: 10,
        padding: 5,
        position: 'absolute',
        top: -18,
        left: -28
    },
    removePreviewButtonListing: {
        marginLeft: 10,
        padding: 5,
        position: 'absolute',
        top: -53,
        left: -28
    },


    // // modal styles: 
    // modalContainer: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: 'black'
    // },
    // zoomContainer: {
    //     width: '100%',
    //     height: '100%',
    // },
    // fullScreenImage: {
    //     width: '100%',
    //     height: '100%',
    // },
    // closeButton: {
    //     position: 'absolute',
    //     top: 50,
    //     left: 10,
    //     zIndex: 9999,
    //     padding: 10,
    // },

})