import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';




const MessagePreviewCard = ({ pfp, name, lastMessage, conversationID }) => {
    // const otherUserID = conversationIDToOtherUserID(conversationID); // to be implemented. Current placeholder is. 
    // not sure if we need this here

    return (
        <View
            style={styles.container}
        >
            {pfp ? (<Image src={pfp} style={styles.image} />) : (<View style={styles.placeholder} />)}

            {/* rightside container */}
            <View style={styles.rigthSideContainer}>
                <Text style={styles.upperText}>
                    {name + ''}
                </Text>
                <Text style={styles.lowerText}>
                    {lastMessage + ''}
                </Text>
            </View>
        </View>
    )
}

export default MessagePreviewCard;


const styles = StyleSheet.create({
    container: { height: 60, width: '98%', display: 'flex', flexDirection: 'row', alignItems: 'center' },
    upperText: { fontSize: 18, fontWeight: '600', color: 'black' },
    lowerText: { fontSize: 14, fontWeight: '400', color: 'gray' },
    rigthSideContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' },
    placeholder: { width: 35, height: 35, backgroundColor: 'black', marginLeft: 14, marginRight: 21, borderRadius: 50 },
    image: { marginLeft: 14, width: 35, height: 35, marginRight: 21 }
})