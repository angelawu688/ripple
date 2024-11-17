import { useEffect, useContext } from 'react'
import { useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
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


const InfoOnboarding = ({ navigation, route }) => {
    const { email, major, concentration } = route.params
    const [gradYear, setGradYear] = useState('')
    const [profPhoto, setProfPhoto] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
                // major: major,
                // concentration: concentration,
                // gradYear: gradYear
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
                        Graduation year
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder=''
                        value={gradYear}
                        onChangeText={setGradYear}
                    />
                </View>

                <View style={{ width: '100%' }}>
                    <Text style={styles.inputHeader}>
                        Upload profile picture
                    </Text>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                        <Text>placeholder</Text>
                    </View>
                </View>
            </View>


            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={styles.button}
                onPress={() => handleSignUp()}
            >
                <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

            </TouchableOpacity>
        </View>
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