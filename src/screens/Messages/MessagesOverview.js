import { useContext, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import MessagePreviewCard from '../../components/MessagePreviewCard'


// TODO CONNECT USER MESSAGES TO FIREBASE
const MessagesOverview = ({ navigation }) => {

    // TODO change this to actually grab the messages
    // currently is imitating something
    useEffect(() => {
        if (conversations) {
            // make a call to setConversations
            setIsLoading(false)
        } else {
            // do nothing
        }
    }, [conversations])

    // grab messages on component mount or as prop
    // for now they are implemented as test message props below
    // note: structure will likely have to change
    const [conversations, setConversations] = useState(testMessageObjects)
    const [isLoading, setIsLoading] = useState(true)


    return (
        <View style={styles.container}>
            {/* checking for conversations is a redundant check */}
            {isLoading && conversations ? (
                <ActivityIndicator size={'large'} />
            ) : (
                <FlatList
                    style={{ width: '100%' }}
                    ListHeaderComponent={null} // blank for now, this is where a header would go 

                    data={conversations}
                    renderItem={({ item: conversation }) => { // note: need to keep items, we are just renaming it to be clear
                        const conversationID = conversation.id

                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Conversation', { conversationID: conversationID })}
                            >
                                <MessagePreviewCard
                                    pfp={conversation.pfp}
                                    name={conversation.otherUserName}
                                    lastMessage={conversation.lastMessage}
                                    conversationID={conversation.id}
                                />
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={conversation => conversation.id} // use the conversationID as a key
                />
            )}
        </View>
    )
}

export default MessagesOverview


const testMessageObjects = [
    { id: 1, pfp: '', otherUserName: 'Jane Doe', lastMessage: 'Is your bike still for sale?', userID: 15 },
    { id: 2, pfp: '', otherUserName: 'Megan Chan', lastMessage: 'Hi, is the Sony camera still available?', userID: 900 },
    { id: 3, pfp: '', otherUserName: 'Will Hunt', lastMessage: 'Hi, is this still available??', userID: 1234 },
]



const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        diplsay: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%'
    },

})