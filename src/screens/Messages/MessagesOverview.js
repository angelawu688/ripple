import { useCallback, useContext, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import MessagePreviewCard from '../../components/MessagePreviewCard'
import { useFocusEffect } from "@react-navigation/native"
import { userContext } from "../../context/UserContext"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../../../firebaseConfig"
import LoadingSpinner from '../../components/LoadingSpinner'


const MessagesOverview = ({ navigation }) => {
    const { user, userData } = useContext(userContext)

    // on component focus, grab all of the conversations for that user
    useFocusEffect(
        useCallback(() => {
            // make sure we have uid
            if (!user?.uid) return;

            // function
            setIsLoading(true);
            const q = query(
                collection(db, "conversations"),
                where("users", "array-contains", user.uid)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedConversations = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setConversations(fetchedConversations);
                console.log(fetchedConversations)
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching conversations:", error);
                setIsLoading(false);
            });

            // cleanup
            return () => unsubscribe();
        }, [user?.uid])
    )


    // grab messages on component mount or as prop
    // for now they are implemented as test message props below
    // note: structure will likely have to change
    const [conversations, setConversations] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    // todo fetch and cache the other users pfp!
    const [otherUserPfp, setOtherUserPfp] = useState(undefined)

    if (isLoading) {
        return (
            <View style={{ flex: 1 }}>
                <LoadingSpinner />
            </View>

        )
    }


    return (
        <View style={styles.container}>
            {/* checking for conversations is a redundant check */}
            {!conversations || conversations.length === 0 ? (
                <View style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                    <Text style={{ fontWeight: '500', fontFamily: 'inter', fontSize: 18 }}>
                        Start a conversation!
                    </Text>
                </View>
            ) : (
                <FlatList
                    style={{ width: '100%' }}
                    ListHeaderComponent={null} // blank for now, this is where a header would go 

                    data={conversations}
                    renderItem={({ item }) => { // note: need to keep items, we are just renaming it to be clear
                        if (!item || !item.id || !item.users || !item.userDetails) {
                            return null
                        }
                        const conversationID = item.id
                        const otherUserId = item.users.find(id => id !== user.uid);
                        const otherUserDetails = item.userDetails[otherUserId];
                        console.log('item', item)


                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Conversation', { conversationID: conversationID })}
                            >
                                <MessagePreviewCard
                                    pfp={otherUserDetails?.pfp}
                                    name={otherUserDetails?.name || "User"}
                                    lastMessage={item.lastMessage}
                                    lastSentAt={item.timestamp}
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        diplsay: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%'
    },
})