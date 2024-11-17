import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Syne_700Bold } from '@expo-google-fonts/syne';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import {doc, getFirestore, setDoc} from "firebase/firestore";
import {createUserWithEmailAndPassword, getAuth, sendEmailVerification} from "firebase/auth";

const EmailOnboarding = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('')

    // TODO ADD LOGIC IF THEY LEAVE IN THE MIDDLE OF ONBOARDING
    const handleEmailConfirm = (user, navigation) => {
        const intervalId = setInterval(async () => {
            console.log("reloading status");
            await user.reload(); // Reload user data
            if (user.emailVerified) {
                console.log('user verified');
                clearInterval(intervalId); // Stop checking
                navigation.navigate('EducationOnboarding', { email: email });
            } else {
                console.log('user not verified');
                setErrorMessage('Verify your email...');
            }
        }, 5000);
    }

    const handleSendEmail = async () => {
        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // console.log('user created');
            const user = userCredential.user;
            // navigation.navigate('Login');
            await sendEmailVerification(user);
            setErrorMessage('Verify your email');
            // console.log("verification email sent");
            handleEmailConfirm(user, navigation);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };


    // focus the top text field on component mount
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <View style={styles.container}>


            <Text style={styles.headerText}>
                What's your email?
            </Text>

            <View style={{ height: 30, }}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>


            <View style={styles.lowerContainer}>
                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Enter UW NetID
                    </Text>
                    <TextInput
                        ref={inputRef} // this is the reference to the input field
                        placeholder='Email'
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                </View>

                <View style={{ width: '100%' }}>
                    <Text style={styles.inputHeader}>
                        Password
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>
            </View>


            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={styles.button}
                onPress={() => {
                    if (!email) {
                        setErrorMessage('Input an email!')
                    } else if (!password) {
                        setErrorMessage('Input a password!')
                    } else {
                        handleSendEmail();
                    }
                }}
            >
                <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

            </TouchableOpacity>
        </View>
    )
}

export default EmailOnboarding;

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