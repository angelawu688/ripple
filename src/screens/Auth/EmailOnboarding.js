import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

const EmailOnboarding = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    return (
        <View style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <TextInput
                placeholder='Email'
                value={email}
                onChangeText={setEmail}
                style={{}}
                keyboardType='email-address'
                autoCapitalize='none'
            />

            {errorMessage && <Text>
                {errorMessage}
            </Text>}

            <TouchableOpacity
                onPress={() => {
                    if (email) {
                        navigation.navigate('EmailConfirmation', { email: email })
                    } else {
                        setErrorMessage('Input an email!')
                    }
                }}
            >
                <Text>
                    Next
                </Text>
            </TouchableOpacity>
        </View>
    )
}


export default EmailOnboarding;