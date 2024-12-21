import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Image } from 'react-native'
import { userContext } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../colors'
import { isLoading } from 'expo-font';
import { PencilSimple } from 'phosphor-react-native';
import {
    uploadPFP,
    updateAllListingsPfp,
    updateAllListingsName,
    updateAllFollowPfp,
    updateAllFollowName
} from '../../utils/firebaseUtils';
import { generateUserKeywords } from '../../utils/search';
import { db } from '../../../firebaseConfig';



// this defines the fields for us so that we can reuse our modal component
// Took out prof photo for now
const fields = [
    { label: 'Email', key: 'email', keyboardType: 'email-address', },
    { label: 'Name', key: 'name', keyboardType: 'default', },
    { label: 'Bio', key: 'bio', keyboardType: 'default', multiline: true, description: 'What makes you unique?' },
    { label: 'Major', key: 'major', keyboardType: 'default', },
    { label: 'Concentration', key: 'concentration', keyboardType: 'default', },
    { label: 'Grad Year', key: 'gradYear', keyboardType: 'numeric', description: 'Enter a four digit year (2026)' },
    { label: 'Instagram', key: 'instagram', keyboardType: 'default', description: 'Enter username' },
    { label: 'LinkedIn', key: 'linkedin', keyboardType: 'url', description: 'Enter profile link' },

];

const PersonalInformation = () => {
    const { user, userData, setUserData } = useContext(userContext)
    const [modalVisible, setModalVisible] = useState(false)
    const [currentField, setCurrentField] = useState('')
    const [input, setInput] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [continueAvailable, setContinueAvailable] = useState('')
    const [isLoadingSave, setIsLoadingSave] = useState(false)
    const [isLoadingImagePicker, setIsLoadingImagePicker] = useState(false)


    // this will give us the modal, and tell us what we are doing
    const handleNext = (field) => {
        setCurrentField(field)
        // set the initial input to the current value
        setInput(userData?.[field.key] || '')
        setErrorMessage('')
        setModalVisible(true);
        setContinueAvailable(false)
    }

    const validateInput = (field, value) => {
        switch (field.key) {
            case 'instagram':
                return /^@[a-zA-Z0-9_]+$/.test(value) || 'Must be a username starting with @';
            case 'twitter':
                // Ensure the value is a valid username (alphanumeric and underscores, starting with @)
                return /^@[a-zA-Z0-9_]+$/.test(value) || 'Must be a username starting with @';
            case 'gradYear':
                // Validate the graduation year
                if (!/^\d{4}$/.test(value)) return 'Enter a four-digit year (2026)';
                const yearNum = parseInt(value, 10);
                const currentYear = new Date().getFullYear();
                if (yearNum < currentYear || yearNum > currentYear + 6) {
                    return `Year must be between ${currentYear} and ${currentYear + 6}`;
                }
                return true;
            default:
                return true; // Default to valid if no validation rules
        }
    };


    const handleSave = async () => {
        if (!currentField) {
            return;
        }
        setIsLoadingSave(true)

        const validationResponse = validateInput(currentField, input);
        if (validationResponse !== true) {
            setErrorMessage(validationResponse);
            setIsLoadingSave(false)
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            if (currentField.key === 'name') {
                // for name updates, we update the name keywords and the name
                const keywords = generateUserKeywords(input);
                await updateDoc(userRef, {
                    name: input,
                    searchKeywords: keywords
                });

                await Promise.all([
                    updateAllListingsName(user.uid, input),
                    updateAllFollowName(user.uid, input, userData.name, userData.pfp)
                ]);
            } else {
                // update the single field for all others
                await updateDoc(userRef, {
                    [currentField.key]: input
                });
            }

            // get fresh user data
            const userDoc = await getDoc(userRef);
            setUserData(userDoc.data());
        } catch (e) {
            console.error(e)
        } finally {
            setModalVisible(false)
            setIsLoadingSave(false)
        }
    }


    const handleChangePfp = async () => {
        try {
            setIsLoadingImagePicker(true)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('We need camera roll permissions to add photos!');
                return;
            }

            // Launch image picker
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: false,
                quality: 0.7,
                selectionLimit: 1
            });

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => ({
                    uri: asset.uri,
                }));
                // backend change
                const downloadLink = await uploadPFP(selectedImages[0].uri, user.uid)
                const db = getFirestore();
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, { pfp: downloadLink });

                await updateAllListingsPfp(user.uid, downloadLink);
                await updateAllFollowPfp(user.uid, downloadLink, userData.pfp, userData.name);

                const userDoc = await getDoc(userRef);
                setUserData(userDoc.data());
            } else {
                // user cancelled, do nothing
                setIsLoadingImagePicker(false)
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingImagePicker(false)
        }
    }

    return (
        <View style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '90%', height: '100%', alignSelf: 'center' }}>
            <TouchableOpacity
                disabled={isLoadingImagePicker}
                onPress={() => handleChangePfp()}
                style={{ width: 87, height: 87, alignSelf: 'center', borderColor: colors.accentGray, borderWidth: 1, borderRadius: 100 }}
            >
                {userData.pfp ?
                    <Image
                        source={{ uri: userData.pfp }}
                        style={{ width: 85, height: 85, borderRadius: 50 }}

                    /> :
                    <View style={{ width: 85, height: 85, backgroundColor: colors.accentGray, borderRadius: 50 }} />
                }

                <View style={{ position: 'absolute', top: 32, right: 32 }}>
                    {isLoadingImagePicker ? <ActivityIndicator color={'white'} /> :
                        <View style={{ marginTop: -8, marginRight: -10 }}>
                            <PencilSimple color={'white'} size={40} />
                        </View>

                        // <Ionicons name='pencil-outline' color={colors.accentGray} size={35} />

                    }
                </View>



            </TouchableOpacity>


            {fields.map((field, index) => (
                <View
                    key={field.key}
                    style={[
                        styles.cardContainer,
                        index === fields.length - 1 && { borderBottomWidth: 0 }, // prevent border on the last one
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
                    {field.label !== 'Email' && <TouchableOpacity onPress={() => handleNext(field)}>
                        <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                    </TouchableOpacity>}
                </View>
            ))}

            {/* modal popup */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >

                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.innerModalContainer}>

                            <Text style={{ fontFamily: 'Syne_700Bold', fontSize: 26, }}>
                                Edit {currentField.label}
                            </Text>
                            {currentField.description && !errorMessage ? <Text
                                style={{ fontFamily: 'Inter', fontSize: 14, color: colors.accentGray, }}>
                                {currentField.description}
                            </Text> : <Text style={{ fontFamily: 'Inter', fontSize: 14, color: colors.errorMessage }}>
                                {errorMessage}
                            </Text>}
                        </View>
                        <TextInput
                            onChangeText={(input) => {
                                setInput(input)
                                setContinueAvailable(true)
                            }}
                            value={input}
                            style={styles.input}
                            keyboardType={currentField.keyboardType}
                        />

                        <View style={styles.modalButtonContainer}>

                            <TouchableOpacity
                                style={[styles.modalCloseButton, { backgroundColor: colors.loginGray }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.modalCloseButtonText, { color: 'black' }]}>
                                    Cancel

                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={input.length === 0 || !continueAvailable}
                                style={[styles.modalCloseButton, { backgroundColor: input.length === 0 || !continueAvailable ? colors.loginGray : colors.neonBlue }]}
                                onPress={() => handleSave()}
                            >

                                {isLoadingSave ? (<ActivityIndicator size={'small'} color={'white'} />) : (
                                    <Text style={[styles.modalCloseButtonText, { color: input.length === 0 || !continueAvailable ? 'black' : 'white' }]}>
                                        Save
                                    </Text>
                                )}


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
        paddingVertical: 0,
        // marginVertical: 6,
        // marginVertical: 6
        marginVertical: 5,
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
        fontFamily: 'inter',
        fontSize: 16,
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
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%'
    },
    modalCloseButton: {
        backgroundColor: 'black',
        paddingHorizontal: 15,
        height: 35,
        borderRadius: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalCloseButtonText: {
        color: 'white',
        fontFamily: 'inter',
        fontWeight: '500',
        fontSize: 16,
        textAlign: 'center',
    },
    innerModalContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
        alignSelf: 'center'
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        marginTop: 20
    },
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