import { useContext, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { userContext } from '../../context/UserContext'

const EmailConfirmation = ({ navigation, route }) => {
    const [code, setCode] = useState('')
    const { email } = route.params
    const [errorMessage, setErrorMessage] = useState('')


    const handleCheckCode = () => {
        if (!code) {
            setErrorMessage('Enter a code!')
            return;
        }

        if (true) { // code is valid
            navigation.navigate('InfoOnboarding', { email: email })

        } else {
            setErrorMessage('Wrong code!')
        }
    }
    return (
        <View style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Text>EmailConfirmation</Text>

            <TextInput
                placeholder='number'
                value={code}
                onChangeText={setCode}
                style={{}}
                keyboardType='numeric'
            />
            {errorMessage && <Text>
                {errorMessage}
            </Text>}

            <TouchableOpacity
                onPress={() => handleCheckCode()}
            >
                <Text>
                    Confirm
                </Text>
            </TouchableOpacity>
        </View>
    )
}


export default EmailConfirmation;