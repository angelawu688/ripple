import { Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';



const BackArrow = () => {
    // useNavigation hook will just grab, rather than passing it in as a prop
    // makes it really easy to reuse and integrate to every screen
    const navigation = useNavigation();


    return (
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"

        >
            <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
    )
}

export default BackArrow;