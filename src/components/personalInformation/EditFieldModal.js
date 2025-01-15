import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../constants/colors';

export function EditFieldModal({
    visible,
    fieldLabel,
    fieldDescription,
    initialValue,
    keyboardType = 'default',
    onClose,
    onSave,
    isLoading = false,
    errorMessage = '',
    multiline = false,
}) {
    const [input, setInput] = useState(initialValue);
    const [isModified, setIsModified] = useState(false);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setInput(initialValue);
        setIsModified(false);
        setValidationError('');
    }, [initialValue, visible]);

    // const handleInputChange = (newValue) => {
    //     setInput(newValue);
    //     setIsModified(true);
    //     const error = validateInput(newValue, field.key);
    //     setValidationError(error);
    // };


    const validateInput = (field, value) => {
        if (!value) return ''; // Allow empty values initially
        switch (field) {
            case 'Bio':
                console.log(value)
                if (value.length > 163) {
                    return 'Bio must be under 163 characters!'
                } else {
                    return ''
                }
            case 'instagram':
                return /^@[a-zA-Z0-9_]+$/.test(value) || 'Must be a username starting with @';
            case 'gradYear':
                // Validate the graduation year
                if (!/^\d{4}$/.test(value)) return 'Enter a four-digit year (2026)';
                const yearNum = parseInt(value, 10);
                const currentYear = new Date().getFullYear();
                if (yearNum < currentYear || yearNum > currentYear + 6) {
                    return `Year must be between ${currentYear} and ${currentYear + 6}`;
                } else {
                    return ''
                }
            default:
                return ''; // Default to valid if no validation rules
        }
    };

    // checks for an error before saving
    const saveInput = (input) => {
        const error = validateInput(fieldLabel, input)
        if (error) {
            setValidationError(error)
        } else {
            onSave(input)
        }
    }

    const isSaveDisabled = !input ||
        !isModified ||
        !!validationError ||
        isLoading ||
        !!errorMessage;

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                keyboardVerticalOffset={-200} // how much the modal gets moved. This should be good?
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback
                    onPress={() => Keyboard.dismiss()}
                >
                    <View
                        style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.innerModalContainer}>
                                <Text style={styles.title}>Edit {fieldLabel}</Text>
                                <Text style={[styles.description, validationError && { color: 'red' }]}>
                                    {validationError || fieldDescription || ''}
                                </Text>
                            </View>

                            <TextInput
                                style={[styles.input, fieldLabel !== 'Bio' && { height: 35, }]}
                                value={input}
                                onChangeText={(text) => {
                                    setInput(text);
                                    setIsModified(true);
                                    setValidationError('');
                                }}
                                keyboardType={keyboardType}
                                multiline={multiline}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, { backgroundColor: colors.loginGray }]}
                                    onPress={onClose}
                                >
                                    <Text style={[styles.buttonText, { color: 'black' }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        {
                                            backgroundColor:
                                                !input || !isModified ? colors.loginGray : colors.neonBlue,
                                        },
                                    ]}
                                    disabled={isSaveDisabled}
                                    onPress={() => saveInput(input)}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={'white'} />
                                    ) : (
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                { color: !input || !isModified ? 'black' : 'white' },
                                            ]}
                                        >
                                            Save
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default EditFieldModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'flex-start',
    },
    innerModalContainer: {
        width: '100%',
    },
    title: {
        fontFamily: 'Rubik',
        fontWeight: '600',
        fontSize: 26,
    },
    description: {
        fontFamily: 'Inter',
        fontSize: 14,
        color: colors.accentGray,
        marginBottom: 10,
    },
    input: {
        width: '100%',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 20,
        paddingVertical: 6
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        height: 35,
        paddingHorizontal: 15,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: '500',
    },
});
