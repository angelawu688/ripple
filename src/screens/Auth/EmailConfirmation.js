// unused

import { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { userContext } from '../../context/UserContext'
import Icon from 'react-native-vector-icons/FontAwesome';

const EmailConfirmation = ({ navigation, route }) => {
    const [code, setCode] = useState('')
    const { email, password } = route.params
    const [errorMessage, setErrorMessage] = useState('')

    // focus the top text field on component mount
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);


    const handleCheckCode = () => {
        if (!code) {
            setErrorMessage('Enter a code!')
            return;
        }

        if (true) { // code is valid
            navigation.navigate('InfoOnboarding', { email: email, password: password })

        } else {
            setErrorMessage('Wrong code!')
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                Enter the code we sent to {email}
            </Text>
            <View style={{ height: 30 }}>
                {errorMessage && <Text style={styles.errorText}>
                    {errorMessage}
                </Text>}
            </View>

            <TextInput
                ref={inputRef}
                placeholder='number'
                value={code}
                onChangeText={setCode}
                style={styles.input}
                keyboardType='numeric'
            />

            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={styles.button}
                onPress={() => handleCheckCode()}
            >
                <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

            </TouchableOpacity>
        </View>
    )
}


export default EmailConfirmation;



const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '100%',
        height: '70%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: '10%'
    },
    headerText: {
        fontSize: 26,
        fontWeight: '600',
        fontFamily: 'Syne_700Bold'
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '100%',
        height: 35,
        paddingHorizontal: 12,
        // shadow
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    errorText: {
        fontFamily: 'inter',
        color: 'red'
    },
    lowerContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 140,
    },
    inputHeader: {
        fontSize: 16,
        marginLeft: 5,
        marginBottom: 6,
        fontFamily: 'inter'
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 15,
        backgroundColor: '#D9D9D9',
        alignSelf: 'flex-end',
        marginTop: 15
    }

})