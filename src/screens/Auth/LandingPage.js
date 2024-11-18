import { StyleSheet, Text, TouchableOpacity, View } from "react-native"


const LandingPage = ({ navigation }) => {
    return (
        <View style={styles.container}>

            <Text style={{ fontSize: 90, fontWeight: '800', fontFamily: 'inter', marginTop: -150 }}>
                LOGO
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('EmailOnboarding')}
                    style={[styles.button, { backgroundColor: 'black' }]}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>
                        Create account
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}
                    style={[styles.button, { backgroundColor: 'white', borderColor: 'black', borderWidth: 1 }]}>
                    <Text style={[styles.buttonText, { color: 'black' }]}>
                        Log in
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}


export default LandingPage;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    button: {
        width: '90%',
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50
    },
    buttonText: {
        fontFamily: 'inter',
        fontSize: 18,
        fontWeight: '600'
    },
    buttonContainer: {
        height: 90,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 75,
        width: '100%',
        alignItems: 'center'
    }
})