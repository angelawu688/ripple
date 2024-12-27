import { useContext, useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import { ToastContext } from '../context/ToastContext'
import { colors } from "../colors";
import { TouchableOpacity } from "react-native";
import { userContext } from "../context/UserContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const ReportModal = ({ visible, onClose, userId }) => {
    const [reportReason, setReportReason] = useState('')
    const { showToast } = useContext(ToastContext);
    const { user, userData } = useContext(userContext);

    const handleSubmit = async () => {
        try {
            // add {userId} to firebase with the corresponding reason
            const userReportsRef = collection(db, "reports", userId, "userReports");
            // we have "userReports" in case we need to add more data later

            const reportData = {
                reportedUserId: userId,
                reason: reportReason,
                reportedBy: user.uid,
                timestamp: serverTimestamp(), // p much same as Date.now, using instead bc this will only be server-side 
            };
            await addDoc(userReportsRef, reportData);
            onClose()
            setReportReason('')
            showToast('User reported!')
        } catch (e) {
            showToast('Error reporting user')
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
                <View style={styles.overlay}>
                    {/* stop prop is bc we are using nested touchables */}
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>Report User</Text>
                            <Text style={{ fontFamily: 'inter' }}>Why are you reporting this user?</Text>

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
                </View>
            </TouchableWithoutFeedback >
        </Modal >
    )
}

export default ReportModal;

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