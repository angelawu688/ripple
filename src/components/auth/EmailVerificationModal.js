import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Check, Repeat, X } from 'phosphor-react-native';

export default function EmailVerificationModal({
    isVisible,
    onClose,
    onResendEmail,
    onCheckVerification,
    errorMessage
}) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.innerModalContainer}>
                        <View style={styles.textContainer}>
                            <Text style={styles.titleText}>
                                Secure your account
                            </Text>
                            <Text style={styles.modalText}>
                                Check your email inbox to verify your Ripple account
                            </Text>
                        </View>

                        <View style={{ height: 30 }}>
                            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={onCheckVerification}
                            >
                                <View style={styles.buttonInner}>
                                    <Check size={20} color='white' weight='bold' />
                                    <Text style={[styles.buttonText, { color: 'white', }]}>
                                        I've Verified
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onResendEmail}
                                style={[styles.modalButton, { backgroundColor: colors.lightgray }]}>
                                <View style={styles.buttonInner}>
                                    <Repeat size={20} color={colors.black} weight='bold' />
                                    <Text style={[styles.buttonText, { color: colors.black, }]}>
                                        Resend email
                                    </Text>

                                </View>

                            </TouchableOpacity>
                        </View>






                    </View>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={onClose}
                    >
                        <X size={26} weight='bold' />
                        {/* <Text style={styles.modalCloseButtonText}>Close</Text> */}
                    </TouchableOpacity>




                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        // padding: 20,
        // padding: 30,
        paddingTop: 60,
        paddingHorizontal: 25,
        paddingBottom: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    innerModalContainer: {
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
        // width: '80%',
        // alignSelf: 'center'
        // paddingHorizontal: 0,
        // paddingTop: 25,
        paddingHorizontal: 12,
    },
    titleText: {
        fontFamily: 'Rubik',
        fontWeight: '700',
        fontSize: 26
    },
    modalText: {
        fontSize: 16,
        marginBottom: 15,
        fontFamily: 'inter',
        textAlign: 'left',
        color: colors.loginBlue,
        marginVertical: 6
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'left',
    },
    modalButtonContainer: {
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        // marginTop: 20,
        // alignItems: 'center'
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    modalButton: {
        width: '100%',
        backgroundColor: colors.loginBlue,
        height: 45,
        borderRadius: 25,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {

    },
    buttonText: {
        fontFamily: 'inter',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 4
    },
    resendButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'center'
    },
    linkText: {
        color: 'blue',
        marginLeft: 6
    },
    manualCheckButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalCloseButton: {
        // backgroundColor: 'black',
        padding: 10,
        // borderRadius: 5,
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center',
        position: 'absolute',
        top: 5, left: 5
    },
    modalCloseButtonText: {
        color: 'white',
        fontFamily: 'inter',
        fontWeight: '600',
        textAlign: 'center',
    },
});