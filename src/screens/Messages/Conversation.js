import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker';



// not to represent the structure––we need time as well
// I am assuming that they will be sorted by time in the DB
const testMessages = [
    { content: 'Hi!', sentBy: '2', },
    { content: 'Hello', sentBy: '1', },
    { content: 'Im tryna buy your fridge', sentBy: '2', },
    { content: 'Bet how much', sentBy: '1', },
    { content: '10 bands', sentBy: '1', },
    { content: 'Nah fuck that', sentBy: '2', },
    { content: 'Ill do 4', sentBy: '2', },
]


const MessageBubble = ({ message, activeUserID }) => {
    const { content, sentBy } = message
    const isCurrentUser = sentBy === activeUserID
    return (
        <View style={[styles.messageBubble, isCurrentUser ? styles.sent : styles.received]}>
            <Text style={[styles.messageText, { color: isCurrentUser ? 'white' : 'black' }]}>
                {content}
            </Text>
        </View>
    )
}


const Conversation = ({ route }) => {
    const { conversationID } = route.params
    // FOR TESTING AND DISPLAY
    // grab the userID from the logged in user
    // grab the messages from the db
    const [messages, setMessages] = useState(testMessages)
    const currentUserID = '1';



    const [input, setInput] = useState('')
    const [img, setImg] = useState(undefined)
    const [openingImagePicker, setOpeningImagePicker] = useState(false)

    // auto-scroll to the bottom. Animated asf too 😮‍💨
    const scrollRef = useRef(null)
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    // testing, lets us see the image in the console after it is picked
    useEffect(() => {
        console.log(img)
    }, [img])

    const handleSendMessage = () => {
        if (!input.trim()) {
            return
        }
        // again, this is a test––update to reflect the actual schema
        const newMessage = { content: input, sentBy: currentUserID }
        setMessages([...messages, newMessage]) // update the frontend
        // UPDATE THE BACKEND HERE
        setInput('')
    }


    const handleAddImage = async () => {
        try {
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

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.fileName || `photo_${Date.now()}.jpg`,
                    type: asset.type || 'image/jpeg',
                }));
                console.log(selectedImages[0])

                // CHANGE PFP HERE
                // TOOD update DB and userContext
            } else {
                // user cancelled, do nothing
            }
        } catch (e) {
            console.log(e);
        }
    }


    return (
        <KeyboardAvoidingView // make sure that we can see input and keyboard
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90} // Adjust offset for iOS status bar height
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
                            </Text></View>}
                </ScrollView>

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

                    {/* TODO */}
                    {/* if image, some logic to replace this with the image */}
                    <TextInput
                        placeholder='Message'
                        value={input}
                        onChangeText={setInput}
                        style={styles.input}
                    />

                    <TouchableOpacity style={[styles.sendButton, { backgroundColor: input.trim() ? 'black' : '#D9D9D9' }]} onPress={handleSendMessage}>
                        <Ionicons name='arrow-redo-outline' size={20} color='white' />
                    </TouchableOpacity>

                </View>
            </View>
        </KeyboardAvoidingView>
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
    }

})