import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Animated } from "react-native"
import Logo from "../../components/Logo";
import { colors } from "../../constants/colors";
import { Wave, Wave2 } from "../../components/Wave";
import { useEffect, useRef } from "react";


export const LandingPage = ({ navigation }) => {

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
                <Text style={{ fontFamily: 'inter', fontWeight: '800', fontSize: 55, color: colors.loginBlue, opacity: 0.65, letterSpacing: -3.5, paddingHorizontal: 10 }}>
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
                    style={[styles.button, { backgroundColor: colors.loginGray, opacity: 0.8 }]}>
                    <Text style={[styles.buttonText, { color: colors.black }]}>
                        Login
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

// export default LandingPage;

export function BlankLandingPage() {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={{ fontFamily: 'inter', fontWeight: '800', fontSize: 55, color: colors.loginBlue, opacity: 0.65, letterSpacing: -3.5, paddingHorizontal: 10 }}>
                    Ripple
                </Text>
            </View>
        </View>
    )


}


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
        width: '100%',
        height: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50
    },
    buttonText: {
        fontFamily: 'inter',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.5
    },
    buttonContainer: {
        height: 110,
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 55,
        width: '80%',
        alignItems: 'center'
    },
    topWaves: {
        position: 'absolute',
        top: 0,
        width: '100%',
        alignItems: 'center',
        zIndex: 2,
        pointerEvents: 'none', // this prevents overlap over the create account button
    },
    bottomWaves: {
        position: 'absolute',
        top: '40%',
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
        pointerEvents: 'none', // this prevents overlap over the create account button
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: '50%',
        padding: 10,
    },
})