import { useContext, useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { userContext } from '../../context/UserContext'
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Icon from 'react-native-vector-icons/FontAwesome';


const EducationOnboarding = ({ navigation, route }) => {
    const { email, password } = route.params
    const [major, setMajor] = useState('')
    const [concentration, setConcentration] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    // focus the top text field on component mount
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                Education
            </Text>

            <View style={{ height: 30, }}>
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            </View>

            <View style={styles.lowerContainer}>
                <View style={{ width: '100%', }}>
                    <Text style={styles.inputHeader}>
                        Major
                    </Text>
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        placeholder=''
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
                        placeholder=""
                        value={concentration}
                        onChangeText={setConcentration}
                    />
                </View>
            </View>

            <TouchableOpacity
                hitSlop={{ top: 0, bottom: 10, left: 10, right: 10 }}
                style={styles.button}
                onPress={() => {
                    if (!major) {
                        setErrorMessage('Input a major!')
                    } else if (!concentration) {
                        setErrorMessage('Input a concentration!')
                    } else {
                        navigation.navigate('EducationOnboarding', { email: email, password: password, major: major, concentration: concentration })
                    }
                }}
            >
                <Icon name="chevron-right" size={20} color="#FFFFFF" style={{ marginLeft: 4, marginTop: 2 }} />

            </TouchableOpacity>
        </View>
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