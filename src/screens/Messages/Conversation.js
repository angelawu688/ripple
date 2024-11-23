import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker';
import ListingCard from '../../components/ListingCard';
import { XCircle } from 'phosphor-react-native';
import { colors } from '../../colors';



// not to represent the structure––we need time as well
// I am assuming that they will be sorted by time in the DB
const testMessages = [
    { textContent: 'Hi!', imageContent: undefined, postContent: undefined, sentBy: '2', },
    { textContent: 'Hello', imageContent: undefined, postContent: undefined, sentBy: '1', },
    { textContent: 'Im tryna buy your fridge', imageContent: undefined, postContent: undefined, sentBy: '2', },
    { textContent: 'Bet how much', imageContent: undefined, postContent: undefined, sentBy: '1', },
    { textContent: '10 bands', imageContent: undefined, postContent: undefined, sentBy: '1', },
    { textContent: 'No thanks', imageContent: undefined, postContent: undefined, sentBy: '2', },
    { textContent: 'Ill do 4', imageContent: undefined, postContent: undefined, sentBy: '2', },
    { textContent: undefined, imageContent: undefined, postContent: undefined, sentBy: '1', }
]


const MessageBubble = ({ message, activeUserID }) => {
    const { textContent, imageContent, postContent, sentBy } = message

    // TODO pull images from here and display within a message bubble
    if (!textContent && !imageContent && !postContent) {
        return;
    }
    const isCurrentUser = sentBy === activeUserID

    // add suport for images and posts

    // TODO make look cleaner
    return (
        <View style={{ flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
            {postContent && (
                <View style={{
                    width: 150,
                    aspectRatio: 1,
                    marginBottom: 10
                }}>
                    <ListingCard listing={postContent} containerWidth={170} />
                </View>
            )}

            {imageContent && (
                <Image
                    style={{ width: 170, height: 170, borderWidth: 1, borderColor: colors.loginGray, borderRadius: 8 }}
                    source={{ uri: imageContent.uri }}
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


const Conversation = ({ route }) => {
    // pass in the listing from the route
    const { listing } = route.params
    const [inputListing, setInputListing] = useState(listing || null)


    // FOR TESTING AND DISPLAY
    // grab the userID from the logged in user
    // grab the messages from the db
    const [messages, setMessages] = useState(testMessages)
    const currentUserID = '1';

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

    const handleSendMessage = (text, image, post, clearInputs) => {
        // if we arent sending anything, return
        if (!text.trim() && !image && !post) {
            return
        }

        // again, this is a test––update to reflect the actual schema
        // right now we have the option to send text, images, or posts
        const newMessage = {
            textContent: text,
            imageContent: image,
            postContent: post,
            sentBy: currentUserID
        };
        // frontend update
        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // UPDATE THE BACKEND HERE
        clearInputs()
    }

    const clearInputs = () => {
        setInput('')
        setImg(null)
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
                    name: asset.fileName || `photo_${Date.now()}.jpg`,
                    type: asset.type || 'image/jpeg',
                }));
                setImg(selectedImages[0])
            } else {
                // user cancelled, do nothing
            }
        } catch (e) {
            console.log(e);
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
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={{ flexGrow: 1, wdith: '100%', paddingHorizontal: 30, paddingTop: 10, paddingBottom: 50 }}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message, index) => {
                        return (
                            <MessageBubble key={index} message={message} activeUserID={currentUserID} />
                        )
                    })}

                    {!messages || messages.length === 0 &&
                        <View style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Text style={{ fontWeight: '500', fontFamily: 'inter', fontSize: 18 }}>
                                Start a conversation!
                            </Text>
                        </View>
                    }
                </ScrollView>



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
                {img?.uri && (
                    <View style={styles.previewImageContainer}>
                        <Image source={{ uri: img?.uri }} style={styles.previewImage} />
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
        marginVertical: 4,
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
        borderRadius: 5,
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