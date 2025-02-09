import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, AppState } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import Asterisk from '../../components/Asterisk';
import EmailVerificationModal from '../../components/auth/EmailVerificationModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

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
    // i actually dont know how effective this will be––something to visit
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
            // create and account and send an email to the user
            // this will throw error if email in use
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user

            // if we successfully create an account
            await sendEmailVerification(user);
            setEmailSent(true)
            setIsModalVisible(true)
        } catch (e) {
            console.error(e)

            // if the email is already in use tell them to just log in!
            if (e.message.indexOf('already-in-use') > 0) {
                try {
                    // sign them in (DO NOT SET USER) to see if they have an account
                    const existingCred = await signInWithEmailAndPassword(auth, email, password)
                    const existingUser = existingCred.user

                    // check if they have a userDoc
                    const userDoc = await getDoc(doc(db, 'users', existingUser.uid))
                    if (!userDoc.exists()) {
                        // this means that they are incomplete
                        // they have auth profile but not data, so we delete them
                        await existingUser.delete()

                        // create a fresh user profile for them, follow previous steps
                        const newUserCred = await createUserWithEmailAndPassword(auth, email, password)
                        const newUser = newUserCred.user

                        // send them verification and update state
                        await sendEmailVerification(newUser)
                        setEmailSent(true)
                        setIsModalVisible(true)
                    } else {
                        // they actually have user data, just tell them to log in
                        setErrorMessage('Email in use! Log in to your account')
                    }
                } catch (signErr) {
                    console.error(signErr)
                    // this is unhandled, and they will be stuck, and delete failed, so just manual delete
                    setErrorMessage('Email in use! Contact support')
                }
            } else {
                // SOME OTHER ERROR
                // give default error message
                setErrorMessage(e.message || 'Error creating account, please try again later')
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
    // this is what works most of the time
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
                What's your UW email?
            </Text>

            <View style={{ height: 30, }}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

            </View>

            <View style={styles.lowerContainer}>
                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Enter @uw.edu email
                        <Asterisk />
                    </Text>
                    <TextInput
                        ref={inputRef} // this is the reference to the input field
                        placeholder='Email'
                        placeholderTextColor={colors.placeholder}
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
                        Create password
                        <Asterisk />
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={colors.placeholder}
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
            <View style={{ width: '100%', }}>
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
            </View>
            <EmailVerificationModal
                isVisible={isModalVisible && emailSent}
                onClose={() => setIsModalVisible(false)}
                onResendEmail={handleResendEmail}
                onCheckVerification={checkEmailVerification}
                errorMessage={errorMessage}
            />

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
        fontWeight: '700',
        fontFamily: 'rubik',
        color: colors.black
    },
    input: {
        backgroundColor: colors.lightgray,
        borderRadius: 12,
        width: '100%',
        height: 35,
        paddingHorizontal: 12,
        // shadow
        // shadowColor: 'rgba(0, 0, 0, 0.25)',
        // shadowOffset: { width: 5, height: 5 },
        // shadowOpacity: 0.5,
        // shadowRadius: 10,
        // elevation: 5,
    },
    errorText: {
        fontFamily: 'inter',
        color: colors.errorMessage
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
        fontFamily: 'inter',
        fontWeight: '400',
        color: colors.loginBlue
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
})