import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, AppState } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../colors';

const EmailOnboarding = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const [emailSent, setEmailSent] = useState(false)
    // are we allowed to assume that this will be false? I think so
    const [verifiedStatus, setVerifiedStatus] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [secureTextEntry, setSecureTextEntry] = useState(true)

    // this allows us to track if the app is in the background or foreground
    const isMounted = useRef(true);
    const inputRef = useRef(null);
    const auth = getAuth();
    const appState = useRef(AppState.currentState);

    // focus the email input on component mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const toggle = () => {
        setSecureTextEntry(!secureTextEntry)
    }

    // listener for auth changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await user.reload();
                const refreshedUser = auth.currentUser;
                if (refreshedUser?.emailVerified && email && password) {
                    navigation.navigate('EducationOnboarding', { email: email, password: password })
                }
            }
        });
        // calm luh cleanup function
        return () => {
            unsubscribe();
            isMounted.current = false;
        };
    }, [auth, navigation, email])


    // listener for app state changes (i.e. background)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            if (subscription?.remove) {
                subscription.remove();
            } else {
                AppState.removeEventListener('change', handleAppStateChange); // older RN versions
            }
        }
    }, [])

    // event handler 
    const handleAppStateChange = async (nextAppState) => {
        // App has come to the foreground, check email verification
        if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                const refreshedUser = auth.currentUser;
                if (refreshedUser?.emailVerified && email && password) {
                    // close modal and navigate
                    setIsModalVisible(false);
                    navigation.navigate('EducationOnboarding', { email: email, password: password });
                } else {
                    // not verified!
                }
            }
        }
        appState.current = nextAppState;
    };

    // handle when the user presses the next button
    const handleNext = async () => {
        setIsLoading(true)
        try {
            //  create and account and send an email to the user
            // this will throw error if email in use
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user


            await sendEmailVerification(user);
            setEmailSent(true)
            setIsModalVisible(true)
        } catch (e) {
            console.log(e)
            // if the email is already in use tell them to just log in!
            if (e.message.indexOf('already-in-use') > 0) {
                setErrorMessage('Email in use! Log in to your account')
            }
        } finally {
            setIsLoading(false);
        }
    }


    const handleResendEmail = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user);
                setErrorMessage('');
                setEmailSent(true);
            } else {
                setErrorMessage('No user is currently logged in.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage('Failed to resend verification email. Please try again.');
        }
    }

    // manual check to verify the email
    const checkEmailVerification = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                const refreshedUser = auth.currentUser;
                if (refreshedUser?.emailVerified) {
                    setIsModalVisible(false);
                    navigation.navigate('EducationOnboarding', { email: email, password: password });
                } else {
                    setErrorMessage('Email not verified yet. Please check your inbox.');
                }
            } else {
                setErrorMessage('No user is currently logged in.');
            }
        } catch (e) {
            console.error(e);
            setErrorMessage('Failed to verify email. Please try again.');
        }
    };


    // return if a password is valid
    // 6 chars, one uppercase letter, one special character
    // design choice: could also just lump into one error message
    const isValidPassword = () => {
        if (password.length < 6) {
            setErrorMessage('Passwords must be at least 6 characters!');
            return false;
        }
        if (!/[A-Z]/.test(password)) {
            setErrorMessage('Passwords must have 1+ uppercase letter!');
            return false;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setErrorMessage('Passwords must have 1+ special character!');
            return false;
        }
        setErrorMessage('');
        return true;
    };

    // returns if valid @uw.edu email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@uw\.edu$/;
        return emailRegex.test(email);
    };

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
                        onChangeText={(text) => {
                            setEmail(text)
                            setErrorMessage('')
                        }}
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
                        onChangeText={(text) => {
                            setPassword(text)
                            setErrorMessage('')
                        }}
                        secureTextEntry={secureTextEntry}
                    />
                    <TouchableOpacity onPress={toggle}
                        style={{
                            width: 40, height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 2,
                            top: 28
                        }}>
                        {secureTextEntry ? (<Ionicons name='eye-off' size={24} color={'black'} />) : (<Ionicons name='eye' size={24} color={'black'} />)}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={[styles.button, { backgroundColor: !isLoading && email && password.length >= 6 ? colors.loginBlue : colors.loginGray }]}

                disabled={isLoading || !email || !password} // disabled when loading
                onPress={() => {
                    if (!email) {
                        setErrorMessage('Input an email!')
                    } else if (!isValidEmail(email)) {
                        setErrorMessage('Enter an email ending in @uw.edu')
                        return;
                    } else if (!isValidPassword()) {
                        // console.log(isValidPassword())
                        // setErrorMessage('Passswords must be 6 characters, contain a number, and a special character')
                        return;
                    }
                    else if (!password) {
                        setErrorMessage('Input a password!')
                    } else {
                        handleNext();
                    }
                }}
            >

                {isLoading ? (<ActivityIndicator color={'white'} size={20} />) : (<Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />)}
                {/* <Text>Send verification</Text> */}

            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible && emailSent}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.innerModalContainer}>
                            <Ionicons name='mail-outline' size={30} />
                            <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 30 }}>
                                Verification sent!
                            </Text>
                        </View>
                        <Text style={styles.modalText}>Check your inbox to verify your email</Text>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity onPress={() => handleResendEmail()}
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'center' }}>
                                <Ionicons name='refresh' size={20} color='blue' />
                                <Text style={[styles.link, { marginLeft: 6 }]}>
                                    Resend email
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.manualCheckButton}
                                onPress={checkEmailVerification}
                            >
                                <Text style={styles.manualCheckButtonText}>I've Verified</Text>
                            </TouchableOpacity>


                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.modalCloseButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </View>
            </Modal>
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
        fontFamily: 'Syne_700Bold',
        color: colors.loginBlue
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
        // backgroundColor: '#D9D9D9',
        alignSelf: 'flex-end',
        marginTop: 15
    },
    link: {
        color: 'blue',
        textAlign: 'center',
    },

    // modal styles:
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // make back darker
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalCloseButtonText: {
        color: 'white',
        fontFamily: 'inter',
        fontWeight: '600',
        textAlign: 'center',
    },
    innerModalContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center'
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '85%',
        marginTop: 20,
        alignItems: 'center'
    },
    manualCheckButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },


})