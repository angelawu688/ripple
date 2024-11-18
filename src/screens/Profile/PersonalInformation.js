import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native'
import { userContext } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import {getAuth} from 'firebase/auth';
import FullLoadingScreen from "../shared/FullLoadingScreen";


// this defines the fields for us so that we can reuse our modal component
const fields = [
    { label: 'Email', key: 'email', keyboardType: 'email-address' },
    { label: 'Name', key: 'name', keyboardType: 'default' },
    // { label: 'Bio', key: 'bio', keyboardType: 'default', multiline: true },
    { label: 'Major', key: 'major', keyboardType: 'default' },
    { label: 'Concentration', key: 'concentration', keyboardType: 'default' },
    { label: 'Graduation Year', key: 'gradYear', keyboardType: 'numeric' },
    // { label: 'Instagram', key: 'instagram', keyboardType: 'default' },
    // { label: 'LinkedIn', key: 'linkedin', keyboardType: 'url' },
    // { label: 'Twitter/X', key: 'twitter', keyboardType: 'default' },
];

const PersonalInformation = () => {
    const { user, setUser } = useContext(userContext)
    const [modalVisible, setModalVisible] = useState(false)
    const [currentField, setCurrentField] = useState('')
    const [input, setInput] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState({})

    // FOR TESTING PURPOSES
    // const [fakeUser, setFakeUser] = useState({
    //     email: 'phunt22@uw.edu',
    //     name: 'Schoolboy Q',
    //     bio: undefined,
    //     major: 'Not CS for long',
    //     gradYear: '2026',
    //     instagram: '@daxflame',
    //     linkedin: 'https://www.linkedin.com/in/william-hunt-7895a3212/',
    //     twitter: '@beabadoobee',
    // })


    useEffect(() => {
        console.log("component mount, user uid is " + user.uid);
        const loadUserInfo = async () => {
            // not getting userDoc????
            try {
                const auth = getAuth();
                const db = getFirestore();
                const user = auth.currentUser;
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                console.log("retrieve userDoc");
                if (userSnap.exists()) {
                    console.log("Document data:", userSnap.data());
                    setUserData(userSnap.data());
                } else {
                    // docSnap.data() will be undefined in this case
                    console.log("No such document!");
                    setErrorMessage("No user available");
                }
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadUserInfo();
    },[userData]);

    if (loading) {
        return <FullLoadingScreen />
    }


    // this will give us the modal, and tell us what we are doing
    const handleNext = (field) => {
        setCurrentField(field)
        // change this to the real user
        // basically we set the initial input to the current value
        setInput(userData?.[field.key] || '')
        setModalVisible(true);
    }

    const handleSave = async () => {
        if (!currentField) {
            return;
        }

        // example of how to validate inputs
        if (currentField.key === 'gradYear' && !validateGradYear(input)) {
            Alert.alert('Invalid Graduation Year', 'Please enter a valid graduation year.');
            return;
        }

        try {
            // fakeUser[currentField.key] = input;
            // // BACKEND CHANGES HERE!
            // // udpate the DB and user context
            // setFakeUser({ ...fakeUser, [currentField.key]: input });
            // // i.e. "setUser(NEW_USER)"
            console.log(input)

            const updatedInfo = {
                [currentField.key]: input,
            }

            const auth = getAuth();
            const db = getFirestore();
            const user = auth.currentUser;
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, updatedInfo);
        } catch (e) {
            console.log(e)
        } finally {
            setModalVisible(false)
        }
        // update the selected state to the user input
    }


    // example function of validating the grad year, keep it relevant
    const validateGradYear = (year) => {
        const currentYear = new Date().getFullYear();
        const yearNum = parseInt(year, 10);
        return yearNum >= currentYear && yearNum <= currentYear + 10;
    };



    return (
        <View style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '90%', height: '100%', alignSelf: 'center' }}>
            <View style={{ height: 30, }}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>
            {fields.map((field, index) => (
                <View
                    key={field.key}
                    style={[
                        styles.cardContainer,
                        index === fields.length - 1 && { borderBottomWidth: 0 },
                    ]}
                >
                    <View style={styles.textContainer}>
                        <Text style={styles.upperText}>{field.label}</Text>
                        <Text
                            style={styles.lowerText}
                            numberOfLines={field.multiline ? undefined : 1}
                            ellipsizeMode="tail"
                        >
                            {userData?.[field.key] || ''}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleNext(field)}>
                        <Ionicons name={'chevron-forward'} size={24} color={'black'} style={styles.icon} />
                    </TouchableOpacity>
                </View>
            ))}


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >

                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.innerModalContainer}>

                            <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 30 }}>
                                Edit {currentField.label}
                            </Text>
                        </View>
                        <TextInput
                            onChangeText={setInput}
                            value={input}
                            style={styles.input}
                        />

                        <View style={styles.modalButtonContainer}>

                            <TouchableOpacity
                                style={[styles.modalCloseButton, { backgroundColor: '#f0f0f0' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.modalCloseButtonText, { color: 'black' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => handleSave()}
                            >
                                <Text style={styles.modalCloseButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>


                    </View>
                </View>
            </Modal>
        </View >
    )
}

export default PersonalInformation;


const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        height: 60,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        paddingVertical: 14,
        marginTop: 12,
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingVertical: 0,
        maxWidth: '85%'

    },
    upperText: {
        fontSize: 12,
        fontFamily: 'inter',
        color: 'gray'
    },
    lowerText: {
        fontFamily: 'inter', fontSize: 16,
        color: 'black'
    },

    // modal styles:
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
        width: '80%'
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: 'black',
        paddingHorizontal: 30, paddingVertical: 15,
        borderRadius: 5,
    },
    modalCloseButtonText: {
        color: 'white',
        fontFamily: 'inter',
        fontWeight: '600',
        textAlign: 'center',
    },
    innerModalContainer: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '80%', alignSelf: 'center' },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '95%', marginTop: 20 },
    manualCheckButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
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
        borderWidth: 1,
        borderColor: 'gray',
        marginTop: 12
    },
})