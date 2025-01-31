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
import Asterisk from "./Asterisk";
import { X } from "phosphor-react-native";

const ReportListingModal = ({ visible, onClose, userId, listingID }) => {
    const [reportReason, setReportReason] = useState('')
    const { showToast } = useContext(ToastContext);
    const { user, userData } = useContext(userContext);

    const handleSubmit = async () => {
        try {
            if (!reportReason) {
                showToast('Must input a reason!', 'error')
                return;
            }
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
            <TouchableWithoutFeedback
                onPress={onClose}
            >
                <KeyboardAvoidingView style={styles.overlay}
                    keyboardVerticalOffset={-100} // how much the modal gets moved. This should be good?
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* stop prop is bc we are using nested touchables */}
                    <TouchableWithoutFeedback
                        onPress={(e) => e.stopPropagation()}

                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>
                                Report Listing

                            </Text>
                            <Text style={styles.middleText}>
                                Please share your reason for reporting this listing
                                <Asterisk />
                            </Text>

                            <TextInput
                                style={styles.textInput}
                                value={reportReason}
                                onChangeText={setReportReason}
                                onSubmitEditing={handleSubmit}
                                placeholder=""
                                multiline
                            />

                            <Text style={styles.middleText}>
                                A moderator from Ripple will review your message
                            </Text>

                            <View style={styles.buttonRow}>

                                <TouchableOpacity style={[styles.button, !reportReason && { backgroundColor: colors.loginGray }]}
                                    onPress={handleSubmit}
                                    disabled={!reportReason}
                                >
                                    <Text style={[styles.text, !reportReason && { color: colors.accentGray }]}>Submit Report</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.closeButton}
                                onPress={onClose}
                            >
                                <X size={28} color={colors.accentGray} />
                            </TouchableOpacity>
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
        padding: 40,
        paddingVertical: 60,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        position: 'relative',
        width: '95%'
    },
    title: {
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'rubik'
    },
    textInput: {
        // borderColor: '#ccc',
        // borderWidth: 1,
        marginVertical: 10,
        padding: 10,
        borderRadius: 5,
        textAlignVertical: 'top',
        fontFamily: 'inter',
        backgroundColor: colors.lightgray
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        height: 30,

    },
    button: {
        backgroundColor: colors.loginBlue,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 50,
        width: '100%',
        height: 40
    },
    text: {
        fontFamily: 'inter',
        fontSize: 16,
        color: 'white',
        fontWeight: '600'
    },
    middleText: {
        fontFamily: 'inter',
        color: colors.loginBlue,
        fontSize: 16,
        marginVertical: 6
    },
    closeButton: {
        position: 'absolute',
        top: 10, left: 10,
    }
});