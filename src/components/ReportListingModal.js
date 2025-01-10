import { useContext, useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { ToastContext } from '../context/ToastContext'
import { colors } from "../constants/colors";
import { TouchableOpacity } from "react-native";
import { userContext } from "../context/UserContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ReportListingModal = ({ visible, onClose, userId, listingID }) => {
    const [reportReason, setReportReason] = useState('')
    const { showToast } = useContext(ToastContext);
    const { user, userData } = useContext(userContext);

    const handleSubmit = async () => {
        try {
            // add {userId} to firebase with the corresponding reason
            const listingReportsRef = collection(db, "reports", userId, "listingReports");
            // we have "userReports" in case we need to add more data later

            const reportData = {
                reportedUserId: userId,
                reason: reportReason,
                reportedBy: user.uid,
                listingId: listingID,
                timestamp: serverTimestamp(), // p much same as Date.now, using instead bc this will only be server-side
            };
            await addDoc(listingReportsRef, reportData);
            onClose()
            setReportReason('')
            showToast('Listing reported!')
        } catch (e) {
            showToast('Error reporting listing')
        }
    }


    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <KeyboardAvoidingView style={styles.overlay}
                                      keyboardVerticalOffset={-200} // how much the modal gets moved. This should be good?
                                      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* stop prop is bc we are using nested touchables */}
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>Report Listing</Text>
                            <Text style={{ fontFamily: 'inter' }}>Why are you reporting this listing?</Text>

                            <TextInput
                                style={styles.textInput}
                                value={reportReason}
                                onChangeText={setReportReason}
                                onSubmitEditing={handleSubmit}
                                placeholder="Type your reason here..."
                                multiline
                            />

                            <View style={styles.buttonRow}>

                                <TouchableOpacity style={styles.buttonWrapper}
                                                  onPress={onClose}
                                >
                                    <Text style={styles.text}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.buttonWrapper, { backgroundColor: colors.neonBlue }]}
                                                  onPress={handleSubmit}
                                >
                                    <Text style={styles.text}>Report</Text>
                                </TouchableOpacity>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback >
        </Modal >
    )
}

export default ReportListingModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99999
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'inter'
    },
    textInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        borderRadius: 5,
        textAlignVertical: 'top',
        fontFamily: 'inter'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        height: 30,

    },
    buttonWrapper: {
        backgroundColor: colors.loginGray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 8
    },
    text: {
        fontFamily: 'inter',
        fontSize: 14
    }
});