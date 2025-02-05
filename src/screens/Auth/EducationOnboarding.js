import { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { userContext } from '../../context/UserContext'
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../constants/colors';
import Asterisk from '../../components/Asterisk';

// test add
const EducationOnboarding = ({ navigation, route }) => {
    const { email, password } = route.params
    const [major, setMajor] = useState('')
    const [concentration, setConcentration] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [gradYear, setGradYear] = useState('')
    const [name, setName] = useState('')

    // focus the top text field on component mount
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={80}
            style={styles.container}
        >
            <Text style={styles.headerText}>
                Education
            </Text>

            <View style={{ height: 30, }}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>

            <View style={styles.lowerContainer}>
                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Full name
                        <Asterisk />
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder='Michael Penix Jr.'
                        placeholderTextColor={colors.placeholder}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Major
                        <Asterisk />
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder='CS'
                        placeholderTextColor={colors.placeholder}
                        value={major}
                        onChangeText={setMajor}
                    />
                </View>

                <View style={{ width: '100%' }}>
                    <Text style={styles.inputHeader}>
                        Concentration
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Data Science"
                        placeholderTextColor={colors.placeholder}
                        value={concentration}
                        onChangeText={setConcentration}
                    />
                </View>

                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Graduation year
                        <Asterisk />
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder='2024'
                        placeholderTextColor={colors.placeholder}
                        value={gradYear}
                        onChangeText={(text) => {
                            // only allow 4 numbers for this!
                            const sanitizedText = text.replace(/[^0-9]/g, '');
                            if (sanitizedText.length <= 4) {
                                setGradYear(sanitizedText);
                            }
                        }}
                    />
                </View>




            </View>

            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={[styles.button, { backgroundColor: !name || !major || gradYear.length !== 4 ? colors.loginGray : colors.loginBlue }]}
                disabled={!name || !major || gradYear.length < 2}
                onPress={() => {
                    if (!major) {
                        // concentration not required
                        setErrorMessage('Enter a major!')
                    } else if (!gradYear) {
                        setErrorMessage('Enter a grad year!')
                    } else if (gradYear.length !== 4) {
                        setErrorMessage('Enter a 4 digit year!')
                    } else {
                        setErrorMessage('')
                        navigation.navigate('InfoOnboarding', { email: email, password: password, major: major, concentration: concentration, gradYear: gradYear, name: name })
                    }
                }}
            >
                <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}


export default EducationOnboarding;

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
        fontWeight: '700',
        fontFamily: 'Rubik',
        color: colors.black
    },
    input: {
        backgroundColor: colors.lightgray,
        borderRadius: 12,
        width: '100%',
        height: 35,
        paddingHorizontal: 12,
        // shadow
        // shadowColor: 'rgba(0, 0, 0, 0.25)',
        // shadowOffset: { width: 5, height: 5 },
        // shadowOpacity: 0.5,
        // shadowRadius: 10,
        // elevation: 5,
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
        height: 270,
    },
    inputHeader: {
        fontSize: 16,
        marginLeft: 5,
        marginBottom: 6,
        fontFamily: 'inter',
        color: colors.loginBlue
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