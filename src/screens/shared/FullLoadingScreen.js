import { View, ActivityIndicator } from 'react-native'


const FullLoadingScreen = () => (
    <View style={{ wdith: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
        <ActivityIndicator size={'large'} />
    </View >
)

export default FullLoadingScreen;