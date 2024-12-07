import { View, ActivityIndicator, Text } from 'react-native'


const FullLoadingScreen = ({ text }) => (
    <View style={{ wdith: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
        <ActivityIndicator size={'large'} />
        {text && (
            <Text>
                {text}
            </Text>
        )}
    </View >
)

export default FullLoadingScreen;