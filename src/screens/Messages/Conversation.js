import { Ionicons } from '@expo/vector-icons'
import { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, FlatList } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import ListingCard from '../../components/ListingCard';
import { XCircle } from 'phosphor-react-native';
import { colors } from '../../colors';
import { collection, onSnapshot } from 'firebase/firestore';
import { getListingFromID, sendMessage } from '../../utils/firebaseUtils';
import { db } from '../../../firebaseConfig';
import { userContext } from '../../context/UserContext';


// TODO in cleanup move this to another file
// TODO add support for text and listings, posts and text, etc. 
const MessageBubble = ({ navigation, message, activeUserID }) => {
    if (!message) {
        return null
    }
    const { textContent, imageUri, postID, sentBy } = message
    const [listing, setListing] = useState(undefined)

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

    // add suport for images and posts

    // TODO make look cleaner
    return (
        <View style={{ flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start', marginVertical: 2 }}>
            {listing && (
                <TouchableOpacity
                    onPress={() => navigation.navigate('ListingScreen', { listingID: listing.id })}

                    style={{
                        width: 150,
                        height: 170,
                        marginVertical: 8,
                    }}>
                    <ListingCard listing={listing} containerWidth={170} />
                </TouchableOpacity>
            )}

            {imageUri && (
                <Image
                    style={{ width: 170, height: 170, borderWidth: 1, borderColor: colors.loginGray, borderRadius: 8 }}
                    source={{ uri: imageUri }}
                />
            )}

            {textContent && textContent.length !== 0 && (
                <View style={[styles.messageBubble, isCurrentUser ? styles.sent : styles.received]}>

                    <Text style={[styles.messageText, { color: isCurrentUser ? 'white' : 'black' }]}>
                        {textContent}
                    </Text>
                </View>
            )}
        </View>
    )
}


const Conversation = ({ navigation, route }) => {
    // pass in the listing from the route
    const { listing, conversationID } = route.params
    const [inputListing, setInputListing] = useState(listing || null)
    const { user } = useContext(userContext)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState(listing ? ('Hi, is this still available?') : '')
    const [img, setImg] = useState(undefined)
    const [openingImagePicker, setOpeningImagePicker] = useState(false)

    // auto-scroll to the bottom. Animated asf too 😮‍💨
    const scrollRef = useRef(null)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

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
        >
            <View style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%', }}>
                {messages?.length > 0 ? (<FlatList
                    data={messages}
                    renderItem={({ item }) => {
                        return (
                            <MessageBubble
                                navigation={navigation}
                                message={item}
                                activeUserID={user.uid}
                            />
                        )
                    }
                    }
                    keyExtractor={(item) => item.id}
                    inverted={true}// This inverts the list
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 30,
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
                {img && (
                    <View style={styles.previewImageContainer}>
                        <Image source={{ uri: img }} style={styles.previewImage} />
                        <TouchableOpacity onPress={() => setImg(null)} style={styles.removePreviewButton}>
                            <XCircle weight='fill' size={30} color={colors.loginGray} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* input bar at the bottom */}
                <View style={styles.inputBar}>
                    <TouchableOpacity onPress={() => handleAddImage()}
                        style={{
                            width: 30, height: 30, borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(0, 0, 0, 0.25)',
                            shadowOffset: { width: 5, height: 5 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            backgroundColor: 'white',
                            marginRight: 10
                        }}>
                        {openingImagePicker ? <ActivityIndicator color='#767676' /> : <Ionicons name='add-outline' size={20} color='#767676' />}
                    </TouchableOpacity>


                    <TextInput
                        placeholder='Message'
                        value={input}
                        onChangeText={setInput}
                        style={styles.input}
                        onSubmitEditing={() => handleSendMessage(input, img, inputListing, clearInputs)}
                    />

                    <TouchableOpacity style={[styles.sendButton, { backgroundColor: input.trim() || img || inputListing ? 'black' : '#D9D9D9' }]} onPress={() => handleSendMessage(input, img, inputListing, clearInputs)}>
                        <Ionicons name='arrow-redo-outline' size={20} color='white' />
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
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    sendButton: {
        marginLeft: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#007aff',
        borderRadius: 20,
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
    }

})