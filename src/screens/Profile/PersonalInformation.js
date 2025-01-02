import { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Image, FlatList } from 'react-native'
import { userContext } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants/colors'
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
import { ProfilePhotoPicker } from '../../components/shared/ProfilePhotoPicker';
import { ToastContext } from '../../context/ToastContext';
import FieldRow from '../../components/personalInformation/EditRow';
import EditFieldModal from '../../components/personalInformation/EditFieldModal';



// this defines the fields for us so that we can reuse our modal component
// Took out prof photo for now
const fields = [
    { label: 'Email', key: 'email', keyboardType: 'email-address', required: false },
    { label: 'Name', key: 'name', keyboardType: 'default', required: true },
    { label: 'Bio', key: 'bio', keyboardType: 'default', multiline: true, description: 'What makes you unique?', required: false },
    { label: 'Major', key: 'major', keyboardType: 'default', required: true },
    { label: 'Concentration', key: 'concentration', keyboardType: 'default', required: false },
    { label: 'Grad Year', key: 'gradYear', keyboardType: 'numeric', description: 'Enter a four digit year (2026)', required: true },
    { label: 'Instagram', key: 'instagram', keyboardType: 'default', description: 'Enter username', required: false },
    { label: 'LinkedIn', key: 'linkedin', keyboardType: 'url', description: 'Enter profile link', required: false },

];

const PersonalInformation = () => {
    const { user, userData, setUserData } = useContext(userContext)
    const { showToast } = useContext(ToastContext)
    const [modalVisible, setModalVisible] = useState(false)
    const [currentField, setCurrentField] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoadingSave, setIsLoadingSave] = useState(false)

    const handleEditPress = (field) => {
        setErrorMessage('');
        setCurrentField(field);
        setModalVisible(true);
    };

    const handleSaveField = async (newValue) => {
        if (!currentField) {
            return;
        }
        setIsLoadingSave(true)

        // validation was moved to the child component
        // const validationResponse = validateInput(currentField, newValue);
        // if (validationResponse !== true) {
        //     setErrorMessage(validationResponse);
        //     setIsLoadingSave(false)
        //     return;
        // }

        try {
            const userRef = doc(db, "users", user.uid);
            if (currentField.key === 'name') {
                // for name updates, we update the name keywords and the name
                const keywords = generateUserKeywords(newValue);
                await updateDoc(userRef, {
                    name: newValue,
                    searchKeywords: keywords
                });

                // await Promise.all([
                //     updateAllListingsName(user.uid, newValue),
                //     updateAllFollowName(user.uid, newValue, userData.name, userData.pfp)
                // ]);
            } else {
                // update the single field for all others
                await updateDoc(userRef, {
                    [currentField.key]: newValue
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

    return (
        <View style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', width: '90%', height: '100%', alignSelf: 'center' }}>
            <FlatList
                data={fields}
                scrollEnabled={false}
                keyExtractor={(item) => item.key}
                renderItem={({ item, index }) => {
                    const canEdit = item.label !== 'Email';
                    return (
                        <FieldRow
                            label={item.label}
                            value={userData?.[item.key] || ''}
                            canEdit={canEdit}
                            onEditPress={() => handleEditPress(item)}
                            required={item.required}
                        />
                    );
                }}
                ListHeaderComponent={
                    <View>
                        <ProfilePhotoPicker
                            currentImage={userData?.pfp}
                            onImagePicked={async (pickedUri) => {
                                try {
                                    const downloadLink = await uploadPFP(pickedUri, user.uid)
                                    const db = getFirestore();
                                    const userRef = doc(db, "users", user.uid);
                                    await updateDoc(userRef, { pfp: downloadLink });

                                    // await updateAllListingsPfp(user.uid, downloadLink);
                                    // await updateAllFollowPfp(user.uid, downloadLink, userData.pfp, userData.name);

                                    const userDoc = await getDoc(userRef);
                                    setUserData(userDoc.data());
                                } catch (e) {
                                    console.log(e)
                                    showToast('Error saving profile picture!')
                                }
                            }}
                        />
                    </View>
                }
            />
            {currentField && (
                <EditFieldModal
                    visible={modalVisible}
                    fieldLabel={currentField.label}
                    fieldDescription={currentField.description}
                    initialValue={userData?.[currentField.key] || ''}
                    keyboardType={currentField.keyboardType}
                    isLoading={isLoadingSave}
                    errorMessage={errorMessage}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSaveField}
                    multiline={currentField.label === 'bio'}
                />
            )}
        </View >
    )
}

export default PersonalInformation;

const styles = StyleSheet.create({
    lowerText: {
        fontFamily: 'Inter',
        fontSize: 16,
        color: 'black',
        maxWidth: '85%'
    },
    upperText: {
        fontSize: 14,
        fontFamily: 'Inter',
        color: colors.loginBlue,
    },
})