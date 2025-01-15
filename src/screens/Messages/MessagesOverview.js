import { useCallback, useContext, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import MessagePreviewCard from '../../components/messages/MessagePreviewCard'
import { useFocusEffect } from "@react-navigation/native"
import { userContext } from "../../context/UserContext"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "../../../firebaseConfig"
import LoadingSpinner from '../../components/LoadingSpinner'
import { colors } from "../../constants/colors"
import { checkIfBlocked } from "../../utils/blockUser"


const MessagesOverview = ({ navigation }) => {
    const { user, userData } = useContext(userContext)

    // const fetchOtherUserData = async (userId) => {
    //     try {
    //         const userDoc = await getDoc(doc(db, "users", userId))
    //         if (userDoc.exists()) {
    //             const otherUserData = userDoc.data()
    //             return {
    //                 id: userId,
    //                 name: otherUserData.name || undefined,
    //                 pfp: otherUserData.pfp || undefined,
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error fetching user data:", error)
    //     }
    //     return null
    // }

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

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const fetchedConversations = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // this returns an array of promises from the conversations
                const filterPromises = fetchedConversations.map(async (conv) => {
                    const otherUserID = conv.users.find(id => id !== user.uid)
                    const hasBlocked = await checkIfBlocked(user.uid, otherUserID)
                    const isBlocked = await checkIfBlocked(otherUserID, user.uid)
                    return {
                        conv: conv,
                        isAllowed: !(hasBlocked || isBlocked)
                    }
                })

                // filter out conversations that we arent allowed to view
                const filterResults = await Promise.all(filterPromises);
                const filteredConversations = filterResults.filter((conv) => conv.isAllowed).map(res => res.conv)

                // sort the conversations in last read order
                setConversations(
                    filteredConversations.sort((a, b) => {
                        // if timestamps are undefined this way we dont break them
                        const bT = b.timestamp || 0;
                        const aT = a.timestamp || 0;
                        return bT - aT;
                    })
                );
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
                    <Text style={{ fontWeight: '600', fontFamily: 'inter', fontSize: 24 }}>
                        No messages
                    </Text>
                    <Text style={{ fontWeight: '400', fontFamily: 'inter', fontSize: 16, marginTop: 4 }}>
                        Visit other users's profiles to message them
                    </Text>
                </View>
            ) : (
                <FlatList
                    style={{ width: '100%' }}
                    ListHeaderComponent={null} // blank for now, this is where a header would go 

                    data={conversations}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 1, backgroundColor: colors.loginGray, width: '85%', alignSelf: 'flex-end' }} />
                    )}
                    renderItem={({ item }) => { // note: need to keep items, we are just renaming it to be clear
                        if (!item || !item.id || !item.users || !item.userDetails) {
                            return null
                        }

                        // find other user's id in this conversation
                        const conversationID = item.id
                        const otherUserId = item.users.find(id => id !== user.uid);
                        const otherUserDetails = item?.userDetails?.[otherUserId] || {}; // grab the userdetails that we store there

                        // handle missing data
                        const lastMessage = item.lastMessage || ''
                        const isUnread = !!lastMessage && lastMessage !== '' && item.lastMessageReadBy !== user.uid


                        return (
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate('Conversation', {
                                        conversationID: conversationID,
                                        otherUserDetails: {
                                            ...otherUserDetails,
                                            id: otherUserId
                                        }
                                    })
                                    navigation.setOptions({
                                        tabBarStyle: { display: 'none' }
                                    })
                                }
                                }
                            >
                                <MessagePreviewCard
                                    pfp={otherUserDetails?.pfp}
                                    name={otherUserDetails?.name || "User"}
                                    lastMessage={lastMessage}
                                    lastSentAt={item.timestamp || 0} // timestamp is 0 for brand new convos
                                    unread={isUnread}
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