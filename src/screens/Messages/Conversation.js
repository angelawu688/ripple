import { Ionicons } from '@expo/vector-icons'
import { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, FlatList, Keyboard, Modal } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import ListingCard from '../../components/listings/ListingCard';
import { ArrowBendRightUp, CaretRight, Plus, User, X, XCircle } from 'phosphor-react-native';
import { colors } from '../../constants/colors';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getListingFromID, sendMessage } from '../../utils/firebaseUtils';
import { db } from '../../../firebaseConfig';
import { userContext } from '../../context/UserContext';
import { ZoomableView } from 'react-native-zoom-toolkit';
import { formatDate, formatDateForMessages } from '../../utils/formatDate';
import { MessageBubble } from '../../components/messages/MessageBubble';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useIsFocused } from '@react-navigation/native';



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
    const [sendingMessage, setSendingMessage] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(true)
    const isFocused = useIsFocused();

    // auto-scroll to the bottom
    const scrollRef = useRef(null)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    // update the top nav bar
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userID: otherUserDetails.id })}
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                >
                    {otherUserDetails?.pfp ? (
                        <Image
                            source={{ uri: otherUserDetails.pfp }}
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
                    {/* <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> */}
                    <Text style={{ fontSize: 18, fontWeight: '500', fontFamily: 'inter', marginRight: 10 }}>
                        {otherUserDetails?.name.split(' ')[0]}
                    </Text>
                    <CaretRight size={14} weight='bold' color={colors.accentGray} />
                    {/* </View> */}
                </TouchableOpacity>
            )
        })
    }, [])

    // load messages from fb
    useEffect(() => {
        setLoadingMessages(true)
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
        setLoadingMessages(false)
        return () => unsubscribe();
    }, [conversationID]);

    // mark the messages as read if they are ready
    useEffect(() => {
        if (!conversationID || !user?.uid || messages.length === 0) {
            return; // bail
        }

        // if not focused, do nothing
        if (!isFocused) {
            return
        }

        const conversationRef = doc(db, "conversations", conversationID);
        updateDoc(conversationRef, {
            lastMessageReadBy: user.uid
        });
    }, [conversationID, user?.uid, messages, isFocused]);



    const handleSendMessage = async (text, image, post, clearInputs) => {
        // if we arent sending anything, return
        if (!text.trim() && !image && !post) {
            return
        }
        setSendingMessage(true)

        // optimistic update, makes it more responsive
        // for post and image, it makes more sense and looks cleaner to just keep them for a bit
        if (text) {
            clearInputs()
        }

        // send it away to our lovely database
        try {
            await sendMessage(
                conversationID,
                user.uid,
                text?.trim(),
                post?.id,
                img,
            )
            // THERE IS A LITTLE GAP HERE TIME WISE, but it is fine for now
            if (!text) { // already cleared, so we are good
                clearInputs()
            }

        } catch (e) {
            console.error('handlesend', e)
            // rollback if we want
        } finally {
            setSendingMessage(false)
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
            console.error(e);
            setOpeningImagePicker(false)
        }
    }

    return (
        <KeyboardAvoidingView // make sure that we can see input and keyboard
            style={{ height: '98%', justifyContent: 'space-between' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            onPress={() => Keyboard.dismiss()}
        >
            <View style={{ flex: 1 }}>
                {loadingMessages || !messages && <LoadingSpinner />}
                {messages.length > 0 && !loadingMessages ? (<FlatList
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                    data={messages}
                    renderItem={({ item, index }) => {
                        const previousMessage = messages[index + 1]; // seems backwards, most recent is last
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
                        const formattedDate = showDate ? formatDateForMessages(item.timestamp / 1000) : null;

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
                        paddingHorizontal: 10,
                        paddingTop: 10,
                        flexGrow: 1,
                        justifyContent: 'flex-end', // this is key for inverted lists to put nonfull at top
                        padding: 10,
                    }}
                />) : inputListing || img ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: '500', fontFamily: 'inter', fontSize: 18 }}>
                            Start a conversation!
                        </Text>
                    </View>

                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: '500', fontFamily: 'inter', fontSize: 18 }}>
                            Start a conversation!
                        </Text>
                    </View>

                )}

                <View style={styles.lowerContainer}>
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
                    <View style={[styles.inputBar, {
                        paddingBottom: 16
                    }]}>
                        <TouchableOpacity onPress={() => handleAddImage()}
                            style={{
                                width: 35, height: 35, borderRadius: 30, display: 'flex', justifyContent: 'center', alignItems: 'center',
                                // shadowColor: 'rgba(0, 0, 0, 0.25)',
                                // // shadowOffset: { width: 5, height: 5 },
                                // shadowOpacity: 0.5,
                                // shadowRadius: 10,
                                // shadowColor: colors.loginBlue,
                                // shadowOpacity: 0.3,
                                // backgroundColor: 'white',
                                borderWidth: 0.4,
                                borderColor: colors.accentGray,
                                marginRight: 10,
                                alignSelf: 'flex-end',
                                marginBottom: 4,

                            }}>
                            {openingImagePicker ? <ActivityIndicator color='#767676' size={'small'} /> : <Plus size={16} color={colors.accentGray} weight='bold' />}
                        </TouchableOpacity>

                        {/* <View></View> */}
                        {/* to put them in the same box, will have to wrap them in a view and go crazy w the CSS */}

                        <TextInput
                            placeholder='Message'
                            placeholderTextColor={colors.placeholder}
                            value={input}
                            onChangeText={setInput}
                            style={[styles.input, { height: inputHeight, textAlignVertical: 'top', fontSize: 18 }]}
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
                        <TouchableOpacity style={[styles.sendButton, { backgroundColor: input.trim() || img || inputListing ? colors.loginBlue : colors.loginGray }]} onPress={() => handleSendMessage(input, img, inputListing, clearInputs)}>
                            {sendingMessage ? <ActivityIndicator /> : <ArrowBendRightUp size={20} color='white' />}
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </KeyboardAvoidingView >
    )
}

export default Conversation;


const styles = StyleSheet.create({
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingTop: 5,
        marginBottom: 4,
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
        paddingHorizontal: 10,
        backgroundColor: colors.neonBlue,
        borderRadius: 50,
        alignSelf: 'flex-end',
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
})