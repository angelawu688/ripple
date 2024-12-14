import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Animated } from "react-native"
import Logo from "../../components/Logo";
import { colors } from "../../colors";
import { Wave, Wave2 } from "../shared/Wave";
import { useEffect, useRef } from "react";


const LandingPage = ({ navigation }) => {
    // TODO on component mount, we fade in the other pieces and have them be animated and stuff

    const randomize = (min, max) => Math.random() * (max - min) + min;

    // create 8 animations refs (x, y)
    const waveAnimations = Array(8).fill(0).map(() => ({
        x: useRef(new Animated.Value(0)).current,
        y: useRef(new Animated.Value(0)).current,
    }));

    // define and start animations based for each of the refs
    useEffect(() => {
        waveAnimations.forEach(({ x, y }) => {
            Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(x, {
                            toValue: randomize(-120, 80),
                            duration: randomize(3000, 8000),
                            useNativeDriver: true,
                        }),
                        Animated.timing(x, {
                            toValue: 0,
                            duration: randomize(3000, 8000),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.sequence([
                        Animated.timing(y, {
                            toValue: randomize(-30, 30),
                            duration: randomize(3000, 8000),
                            useNativeDriver: true,
                        }),
                        Animated.timing(y, {
                            toValue: 0,
                            duration: randomize(3000, 8000),
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        });
    }, [waveAnimations]);

    return (
        <View style={styles.container}>

            {/* Top waves */}
            <View style={styles.topWaves}>
                {waveAnimations.slice(0, 4).map((animation, index) => (
                    <Wave
                        key={`top-wave-${index}`}
                        width={randomize(500, 600)}
                        color={colors.neonBlue}
                        animatedStyle={{
                            transform: [
                                { translateX: animation.x },
                                { translateY: animation.y },
                            ],
                        }}
                    />
                ))}
                {/* <Text>
                    Top
                </Text> */}
            </View>


            {/* Logo */}
            <View style={styles.logoContainer}>
                {/* <Logo fontSize={65} /> */}
                <Text style={{ fontFamily: 'Syne', fontWeight: '700', fontSize: 65, color: '#51A2B0' }}>
                    Ripple
                </Text>
            </View>

            {/* wave 2––being weird in the bottom waves view so if we have issues this is why */}
            <View style={{ position: 'absolute', top: '20%', left: -40 }}>
                <Wave2 width={520} color={colors.loginBlue}
                    style={{ position: 'absolute', top: 0 }}
                    animatedStyle={{
                        transform: [
                            // 7 is the last one
                            { translateX: waveAnimations[7].x },
                            { translateY: waveAnimations[7].y },
                        ],
                    }} />
            </View>


            {/* Bottom waves */}
            <View style={styles.bottomWaves}>

                {/* the last 3  */}
                {waveAnimations.slice(4).map((animation, index) => (
                    <Wave
                        key={`bottom-wave-${index}`}
                        width={randomize(500, 600)}
                        color={colors.neonBlue}
                        animatedStyle={{
                            transform: [
                                { translateX: animation.x },
                                { translateY: animation.y },
                            ],
                        }}
                    />
                ))}
                {/* <Text>
                    Bottom
                </Text> */}
            </View>


            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    hitSlop={{ top: 30, bottom: 5, left: 10, right: 10 }}
                    onPress={() => navigation.navigate('EmailOnboarding')}
                    style={[styles.button, { backgroundColor: colors.loginBlue }]}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>
                        Create account
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    hitSlop={{ top: 5, bottom: 30, left: 10, right: 10 }}
                    onPress={() => navigation.navigate('Login')}
                    style={[styles.button, { backgroundColor: 'white', borderColor: colors.loginBlue, borderWidth: 1 }]}>
                    <Text style={[styles.buttonText, { color: colors.loginBlue }]}>
                        Login
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
        flexDirection: 'column'

    },
    button: {
        width: '90%',
        height: 45,
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
        height: 110,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 75,
        width: '100%',
        alignItems: 'center'
    },
    topWaves: {
        position: 'absolute',
        top: 0,
        width: '100%',
        alignItems: 'center',
        zIndex: 2, // Ensure top waves are above bottom waves,
    },
    bottomWaves: {
        position: 'absolute',
        top: '40%',
        width: '100%',
        alignItems: 'center',
        zIndex: 1, // Lower zIndex than top waves
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '35%'
        // marginVertical: 40, // Space between waves and logo
    },
})