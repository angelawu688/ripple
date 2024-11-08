import { View, Text } from 'react-native'

const Conversation = ({ route }) => {
    const { conversationID } = route.params
    return (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
            <Text>
                Conversation
            </Text>
            <Text>
                with conversationID: {conversationID}
            </Text>
        </View>
    )
}

export default Conversation;