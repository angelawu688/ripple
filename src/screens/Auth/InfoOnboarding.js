import { useEffect, useContext } from 'react'
import { useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Modal, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Pressable } from 'react-native'
import {
    getAuth,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { userContext } from '../../context/UserContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors';
import Asterisk from '../../components/Asterisk'
import { CheckSquare, Square, UploadSimple } from 'phosphor-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadPFP } from '../../utils/firebaseUtils'
import { generateUserKeywords } from '../../utils/search'
import { links } from '../../constants/links';
import { ToastContext } from '../../context/ToastContext';
import { Linking } from 'react-native';
import { openLink } from '../../utils/socialUtils';
import EditFieldModal from '../../components/personalInformation/EditFieldModal'


const InfoOnboarding = ({ navigation, route }) => {
    const { email, password, major, concentration, gradYear, name } = route.params
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [pfp, setPfp] = useState(undefined)
    const [bio, setBio] = useState('')
    const [loadingImage, setLoadingImage] = useState(false)
    const [ig, setIG] = useState('')
    const [showIGModal, setShowIGModal] = useState(false)
    const [li, setLI] = useState('')
    const [showLIModal, setShowLIModal] = useState(false)
    const [currentField, setCurrentField] = useState({})
    const [input, setInput] = useState('')
    const [continueAvailable, setContinueAvailable] = useState(false);
    const [isLoadingSave, setIsLoadingSave] = useState(false)
    const [inputError, setInputError] = useState('')
    const [bioHeight, setBioHeight] = useState(50)
    const { setUser, setUserData, setSavedPosts, setUserListings, setUserFollowingIds } = useContext(userContext);
    const [agreed, setAgreed] = useState(false)
    const { showToast } = useContext(ToastContext)

    // focus the top text field on component mount
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSave = () => {
        if (currentField.key === 'ig') {
            // validate inputs
            if (!input.trim().length > 1) {
                setInputError('Enter your username!')
                return
            } else if (input.trim().indexOf('@') !== 0) {
                setInputError('Username must start with @!')
                return
            }
            setIG(input.trim());
        } else if (currentField.key === 'li') {
            // validate inputs. How? 
            // Just the same check if its a viable link?
            setLI(input.trim());
        }
        setInputError('')
        setShowIGModal(false);
        setShowLIModal(false);
        setCurrentField({});
        setInput('')
        setContinueAvailable(false)
    };


    const handleSignUp = async () => {
        setIsLoading(true)
        // validation
        if (!pfp) {
            setErrorMessage('Upload a profile picture!')
            setIsLoading(false)
            return;
        }

        if (bio.length > 163) {
            setErrorMessage('Bio must be under 163 characters')
            setIsLoading(false)
            return;
        }

        if (!agreed) {
            setErrorMessage('Must agree to Terms of Service and Privacy Policy!')
            setIsLoading(false)
            return;
        }

        try {
            const auth = getAuth();
            const db = getFirestore();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const keywords = generateUserKeywords(name)

            let pfpURL = ''
            if (pfp) {
                pfpURL = await uploadPFP(pfp, user.uid)
            }
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: new Date(),
                major: major,
                concentration: concentration,
                gradYear: gradYear,
                name: name,
                following: [],
                followers: [],
                instagram: ig,
                linkedin: li,
                pfp: pfpURL, // stores a reference to our storage :)
                searchKeywords: keywords,

            });
            const userDoc = await getDoc(doc(db, "users", user.uid))
            setUserData(userDoc.data());
            setSavedPosts([]);
            setUserListings([]);
            setUserFollowingIds([]);
            setUser(user); // this will navigate to the home page
        } catch (error) {
            let errorMsg = 'An error occurred. Please try again later.';
            if (error.code === 'auth/invalid-email') {
                // shouldnt happen, but if it does then we know. This is handled in the first screen, email doesnt change
                errorMsg = 'Invalid email address.';
            } else if (error.code === 'auth/wrong-password') {
                // shouldnt happen
                errorMsg = 'Incorrect password.';
            } else if (error.code === 'auth/user-not-found') {
                // shouldnt happen
                errorMsg = 'No user found with this email.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg = 'Network error. Please check your connection.';
            } else {
                // if this happens idk what it is, just use the default error message
                console.error(error.message);
            }
            setErrorMessage(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePfp = async () => {
        try {
            setLoadingImage(true)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('We need camera roll permissions to add photos!');
                return;
            }

            // Launch image picker
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7,
                selectionLimit: 1
            });

            if (!result.canceled) {
                setPfp(result.assets[0].uri) // just set the local uri to the first one
                // const selectedImages = result.assets.map(asset => ({
                //     uri: asset.uri,
                // }));
                // setPfp(selectedImages[0].uri)
            } else {
                // user cancelled, do nothing
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingImage(false)
        }
    }

    if (isLoading) {
        return <FullLoadingScreen />
    }

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={80}
                style={[styles.container,]}
                onPress={() => Keyboard.dismiss()}
            >
                <Text style={styles.headerText}>
                    Personal
                </Text>

                <View style={{ minHeight: 20, marginBottom: 10 }}>
                    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                </View>

                <View style={styles.lowerContainer}>
                    <View style={{ width: '100%', }}>
                        <Text style={styles.inputHeader}>
                            Upload profile picture
                            <Asterisk />
                        </Text>

                        {!pfp ? (<TouchableOpacity onPress={() => handleChangePfp()}
                            style={{ width: '100%', height: 65, borderWidth: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 15, borderStyle: 'dashed', borderColor: '#808080', marginLeft: 8, alignSelf: 'center', marginTop: 8 }}>
                            {loadingImage ? (<ActivityIndicator />) : (<UploadSimple size={24} color={'#808080'} />)}

                        </TouchableOpacity>) : (
                            <TouchableOpacity onPress={() => handleChangePfp()}
                                style={{ width: 65, height: 65, borderWidth: 5, borderColor: colors.loginGray, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 50, marginLeft: 8, alignSelf: 'center', marginTop: 8 }}>
                                <Image
                                    source={{ uri: pfp }}
                                    style={{ width: 64, height: 64, borderRadius: 50 }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ width: '100%', marginTop: 20, marginBottom: 20 }}>
                        <Text style={styles.inputHeader}>
                            Bio
                        </Text>
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { height: bioHeight, textAlignVertical: 'top' }]}
                            placeholder='Just a chill guy'
                            multiline={true}
                            value={bio}
                            onChangeText={setBio}
                            // makes it dynamically sized
                            onContentSizeChange={(contentWidth, contentHeight) => {
                                const minHeight = 35;
                                const maxHeight = 100; // optional max
                                if (contentHeight < minHeight) {
                                    setBioHeight(minHeight);
                                } else if (contentHeight > maxHeight) {
                                    setBioHeight(maxHeight);
                                } else {
                                    setBioHeight(contentHeight);
                                }
                            }}
                        />
                        <Text style={[{ color: bio.length > 163 ? colors.errorMessage : colors.placeholder },
                        {
                            marginTop: 4,

                        }
                        ]}>
                            {bio.length} / 163
                        </Text>
                    </View>

                    <View style={{ width: '100%', }}>
                        <Text style={styles.inputHeader}>
                            Add socials (optional)
                        </Text>
                        <View style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setCurrentField({
                                        key: 'ig',
                                        label: 'Instagram',
                                        description: 'Enter username starting with @',
                                        placeholder: '@williamhuntt'
                                    })
                                    setInput(ig || '')
                                    setInputError('')
                                    setContinueAvailable(!!ig) // if already set, save is enabled
                                    setShowIGModal(true)
                                }}

                                style={styles.socialButton}>
                                <LinearGradient
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{
                                        flex: 1, borderRadius: 15,
                                        width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center'
                                    }}
                                    colors={['#FFA74C', '#BC32B4']}

                                >
                                    <Image
                                        style={styles.image}
                                        source={require('../../../assets/images/IG_logo.png')}
                                    />
                                </LinearGradient>

                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#0274B3' }]}
                                onPress={() => {
                                    setCurrentField({
                                        key: 'li',
                                        label: 'LinkedIn',
                                        description: 'Enter your LinkedIn URL',
                                        error: 'Username must start with @!',
                                        placeholder: 'https://...'
                                    })
                                    setInput(li || '')
                                    setInputError('')
                                    setContinueAvailable(!!li) // if already set, save is enabled
                                    setShowLIModal(true)
                                }}

                            >
                                <Image
                                    style={styles.image}
                                    source={require('../../../assets/images/LI_logo.png')}
                                />

                            </TouchableOpacity>

                        </View>
                    </View>

                </View>
                <View style={{
                    width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 15
                }}>

                    <Pressable onPress={() => setAgreed(prev => !prev)}>
                        {agreed ? (
                            <CheckSquare size={32} color={colors.loginBlue} />
                        ) : (
                            <Square size={32} color={colors.accentGray} />
                        )}
                    </Pressable>
                    <Text style={{ fontSize: 12, maxWidth: '75%', fontFamily: 'inter' }} numberOfLines={2}>
                        To create an account, you must agree to our{' '}
                        <Text
                            onPress={() => openLink(links.termsOfService, showToast)}
                            style={styles.link}

                        >
                            Terms of Service
                        </Text>
                        {' '}and{' '}
                        <Text
                            onPress={() => openLink(links.privacyPolicy, showToast)}
                            style={styles.link}
                        >
                            Privacy Policy
                        </Text>
                    </Text>
                    <TouchableOpacity
                        hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                        style={[styles.button, { backgroundColor: pfp && bio.length <= 163 ? colors.loginBlue : colors.loginGray }]}
                        disabled={!pfp || bio.length > 163}
                        onPress={() => handleSignUp()}
                    >
                        <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

                    </TouchableOpacity>
                </View>

                <EditFieldModal
                    visible={showIGModal}
                    fieldLabel="Instagram"
                    fieldDescription={inputError || "Enter username starting with @"}
                    initialValue={ig}
                    onClose={() => {
                        setShowIGModal(false);
                        setInput('');
                        setInputError('');
                        setContinueAvailable(false);
                    }}
                    onSave={(newValue) => {
                        // Validate Instagram handle
                        if (!newValue.trim().length > 1) {
                            setInputError('Enter your username!');
                            return;
                        }
                        if (newValue.trim().indexOf('@') !== 0) {
                            setInputError('Username must start with @!');
                            return;
                        }
                        setIG(newValue.trim());
                        setShowIGModal(false);
                    }}
                    isLoading={isLoadingSave}
                    errorMessage={inputError}
                />

                <EditFieldModal
                    visible={showLIModal}
                    fieldLabel="LinkedIn"
                    fieldDescription="Enter your LinkedIn URL"
                    initialValue={li}
                    onClose={() => {
                        setShowLIModal(false);
                        setInput('');
                        setInputError('');
                        setContinueAvailable(false);
                    }}
                    onSave={(newValue) => {
                        setLI(newValue.trim());
                        setShowLIModal(false);
                    }}
                    isLoading={isLoadingSave}
                    errorMessage={inputError}
                    keyboardType="url"
                />
            </KeyboardAvoidingView >
        </TouchableWithoutFeedback>
    )
}


export default InfoOnboarding;

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
        fontFamily: 'Rubik'
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: '100%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        // shadow
        shadowColor: 'rgba(0, 0, 0, 0.25)',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
        maxHeight: 100,

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
    },
    inputHeader: {
        fontSize: 16,
        marginLeft: 5,
        marginBottom: 6,
        fontFamily: 'inter',
        color: colors.loginBlue
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
    },
    socialButton: {
        width: 140,
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15
    },
    image: {
        height: 25, width: 25
    },
    link: {
        color: colors.loginBlue,
        textDecorationLine: 'underline'
    }

})