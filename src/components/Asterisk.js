import { Text } from 'react-native'
import { colors } from '../constants/colors';

const Asterisk = () => {
    return (
        <Text style={{ color: colors.errorMessage }}>
            {' *'}
        </Text>
    )
}

export default Asterisk;