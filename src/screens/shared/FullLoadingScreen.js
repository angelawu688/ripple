import { View, ActivityIndicator, Text } from 'react-native'
import LoadingSpinner from '../../components/LoadingSpinner';


const FullLoadingScreen = ({ text }) => (
    <View style={{ wdith: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }} >
        <LoadingSpinner size={132} />
        {text && (
            <Text>
                {text}
            </Text>
        )}
    </View >
)

export default FullLoadingScreen;