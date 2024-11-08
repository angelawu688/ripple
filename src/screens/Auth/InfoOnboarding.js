import { useContext, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { userContext } from '../../context/UserContext'

const InfoOnboarding = ({ navigation, route }) => {
    const { email } = route.params
    const [input, setInput] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { user, setUser } = useContext(userContext)


    const handleNext = () => {
        if (!email || !input) { // checking logic
            setErrorMessage('input an email!')
        }

        setUser(email) // this will change us to logged in navigator

    }

    return (
        <View style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <TextInput
                placeholder='info'
                value={input}
                onChangeText={setInput}
                style={{}}

                autoCapitalize='none'
            />

            {errorMessage && <Text>
                {errorMessage}
            </Text>}

            <TouchableOpacity
                onPress={() => { handleNext() }}
            >
                <Text>
                    Next
                </Text>
            </TouchableOpacity>
        </View>
    )
}


export default InfoOnboarding;