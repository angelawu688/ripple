import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import Logo from "../../components/Logo";
import { colors } from "../../colors";


const LandingPage = ({ navigation }) => {
    // TODO on component mount, we fade in the other pieces and have them be animated and stuff
    return (
        <View style={styles.container}>

            <View style={{ marginTop: '-35%' }}>
                <Logo fontSize={65} />
            </View>


            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('EmailOnboarding')}
                    style={[styles.button, { backgroundColor: colors.loginBlue }]}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>
                        Create account
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}
                    style={[styles.button, { backgroundColor: 'white', borderColor: colors.loginBlue, borderWidth: 1 }]}>
                    <Text style={[styles.buttonText, { color: colors.loginBlue }]}>
                        Login
                    </Text>
                </TouchableOpacity>

                {/* STRICTLY FOR TESTING */}
                {/* <TouchableOpacity
                    onPress={() => {
                        //  password, major, concentration, gradYear, name } = route.params
                        navigation.navigate('InfoOnboarding', {
                            email: 'phunt22@useWindowDimensions.edu',
                            password: 'password',
                            major: 'CS',
                            concentration: 'cs',
                            gradYear: 2040,
                            name: 'Will'
                        })
                    }}

                >
                    <Text>
                        info ob
                    </Text>
                </TouchableOpacity> */}
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
        flexDirection: 'column'

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
        fontSize: 20,
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