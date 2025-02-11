import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { formatDate } from '../../utils/formatDate'
import { useEffect } from 'react';
import { User } from 'phosphor-react-native';
import { colors } from '../../constants/colors';




const MessagePreviewCard = ({ pfp, name, lastMessage, lastSentAt, unread = false }) => {
    // const otherUserID = conversationIDToOtherUserID(conversationID); // to be implemented. Current placeholder is. 
    // not sure if we need this here
    // if (!lastMessage) {
    //     // nothing has been sent, we dont want to display that
    //     return null;
    // }

    return (
        <View
            style={[styles.container]}
        >
            <View style={{ width: '14%' }}>
                {pfp ? (
                    <Image
                        src={pfp}
                        style={styles.image}
                    />) : (
                    <View style={styles.placeholder}>
                        <User size={18} />
                    </View>
                )}
                {unread && <View style={styles.badge} />}
            </View>



            {/* rightside container */}
            <View style={styles.rightSideContainer}>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Text style={[styles.upperText, { color: unread ? colors.loginBlue : 'black' }]}>
                        {name + ''}
                    </Text>
                    <Text style={[styles.lastSentText, { color: unread ? colors.loginBlue : colors.accentGray }]}>
                        {/*  */}
                        {formatDate(lastSentAt / 1000)}
                    </Text>
                </View>

                <Text
                    style={styles.lowerText}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                >
                    {lastMessage || 'No messages yet.'}
                </Text>

            </View>
        </View>
    )
}

export default MessagePreviewCard;


const styles = StyleSheet.create({
    container: {
        height: 60,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    upperText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'black',
        fontFamily: 'inter'
    },
    lowerText: {
        fontSize: 14,
        fontWeight: '400',
        color: 'gray',
        fontFamily: 'inter'
    },
    rightSideContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '82%'
    },
    placeholder: {
        width: 32,
        height: 32,
        backgroundColor: colors.loginGray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 14,
        marginRight: 21,
        borderRadius: 50
    },
    image: {
        marginLeft: 14,
        width: 32,
        height: 32,
        marginRight: 21,
        borderRadius: 50
    },
    lastSentText: {
        fontFamily: 'inter',
        color: colors.accentGray,
        fontSize: 16
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: 5,
        backgroundColor: 'red',
        borderRadius: 4,
        minWidth: 17,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
        fontFamily: 'inter',
    }
})