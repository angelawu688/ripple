import { useEffect, useContext } from 'react'
import { useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native'
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { userContext } from '../../context/UserContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import FullLoadingScreen from '../shared/FullLoadingScreen'
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../colors';


const InfoOnboarding = ({ navigation, route }) => {
    const { email, password, major, concentration, gradYear, } = route.params
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const [pfp, setPfp] = useState(undefined)
    const { setUser } = useContext(userContext);

    // focus the top text field on component mount
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);


    const handleSignUp = async () => {
        setIsLoading(true)
        try {
            const auth = getAuth();
            const db = getFirestore();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                createdAt: new Date(),
                major: major,
                concentration: concentration,
                gradYear: gradYear
                // profile photo requires firebase storage
            });
            setUser(user); // this will navigate to the home page
        } catch (error) {
            console.log(error.message);
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePfp = async () => {
        try {
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
                const selectedImages = result.assets.map(asset => ({
                    uri: asset.uri,
                    name: asset.fileName || `photo_${Date.now()}.jpg`,
                    type: asset.type || 'image/jpeg',
                }));
                console.log('first image', selectedImages[0])
                setPfp(selectedImages[0]) // this will give us the image object (uri is most important)
            } else {
                // user cancelled, do nothing
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (isLoading) {
        return <FullLoadingScreen />
    }

    return (
        <View style={styles.container}>


            <Text style={styles.headerText}>
                Personal Info
            </Text>

            <View style={{ height: 30, }}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>


            <View style={styles.lowerContainer}>
                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Name
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder='Michael Penix Jr.'
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Upload profile picture
                    </Text>

                    {!pfp ? (<TouchableOpacity onPress={() => handleChangePfp()}
                        style={{ width: '100%', height: 65, borderWidth: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 15, borderStyle: 'dashed', borderColor: '#808080', marginLeft: 8, alignSelf: 'center', marginTop: 8 }}>
                        <Ionicons name={'share-outline'} size={24} color={'#808080'} style={{ marginBottom: 4 }} />
                    </TouchableOpacity>) : (
                        <TouchableOpacity onPress={() => handleChangePfp()}
                            style={{ width: 65, height: 65, borderWidth: 5, borderColor: colors.loginGray, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 50, marginLeft: 8, alignSelf: 'center', marginTop: 8 }}>


                            <Image
                                source={{ uri: pfp.uri }}
                                style={{ width: 64, height: 64, borderRadius: 50 }}
                            />
                        </TouchableOpacity>
                    )
                    }




                </View>
            </View>


            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={[styles.button, { backgroundColor: name && pfp ? colors.loginBlue : colors.loginGray }]}
                onPress={() => handleSignUp()}
            >
                <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

            </TouchableOpacity>
        </View >
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
        height: 180,
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