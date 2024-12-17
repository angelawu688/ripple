import React, { useContext, useEffect } from 'react'
import { ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { colors } from '../colors'
import { ChatCircleDots, Export, Link, X } from 'phosphor-react-native'
import { View } from 'react-native'
import { BlurView } from 'expo-blur'
import { sendProfile } from '../utils/socialUtils'
import { userContext } from '../context/UserContext'

export default function ShareModal({ isVisible, qrCode, setShareModalVisible }) {
    const { user, userData } = useContext(userContext)


    const topCircleAnim = new Animated.ValueXY({ x: -10, y: -10 })
    const bottomCircleAnim = new Animated.ValueXY({ x: -10, y: -10 })

    const startAnimation = () => {
        // random amount within a small range
        const randomOffset = () => Math.random() * 40


        const animateCircles = () => {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(topCircleAnim, {
                        toValue: {
                            x: randomOffset(),
                            y: randomOffset()
                        },
                        duration: 5000,
                        useNativeDriver: true
                    }),
                    Animated.timing(topCircleAnim, {
                        toValue: { x: 10, y: 20 },
                        duration: 4000,
                        useNativeDriver: true
                    })
                ]),
                Animated.sequence([
                    Animated.timing(bottomCircleAnim, {
                        toValue: {
                            x: randomOffset(),
                            y: randomOffset()
                        },
                        duration: 3000,
                        useNativeDriver: true
                    }),
                    Animated.timing(bottomCircleAnim, {
                        toValue: { x: -20, y: 20 },
                        duration: 5000,
                        useNativeDriver: true
                    })
                ])
            ]).start(() => animateCircles())
        }
        animateCircles()
    }



    // start animation when component mounts
    useEffect(() => {
        if (isVisible) {
            startAnimation()
        }
    }, [isVisible])



    return (
        <Modal
            transparent={true}
            visible={isVisible}
            onRequestClose={() => setShareModalVisible(false)}
            animationType="fade"
        >
            <BlurView
                intensity={50}
                style={StyleSheet.absoluteFill} // did not know this was a thing until now lol
            >

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShareModalVisible(false)}
                >
                    <X size={32} color={colors.black} weight='bold' />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.container}
                    activeOpacity={1} // makes it have no visual effect
                    onPress={() => setShareModalVisible(false)}
                >

                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.subContainer}
                    >

                        {/* BLUR CONTAINER */}
                        <View style={styles.blurCirclesContainer}>
                            <Animated.View
                                style={[
                                    styles.circleWrapper,
                                    styles.topCircle,
                                    {
                                        transform: [
                                            { translateX: topCircleAnim.x },
                                            { translateY: topCircleAnim.y }
                                        ]
                                    }
                                ]}
                            >
                                <View style={[styles.blurCircle, { backgroundColor: colors.loginBlue }]} />
                            </Animated.View>
                            <Animated.View
                                style={[
                                    styles.circleWrapper,
                                    styles.bottomCircle,
                                    {
                                        transform: [
                                            { translateX: bottomCircleAnim.x },
                                            { translateY: bottomCircleAnim.y }
                                        ]
                                    }
                                ]}
                            >
                                <View style={[styles.blurCircle, { backgroundColor: '#33D4D1' }]} />
                            </Animated.View>

                            <BlurView // the blurview is placed ON TOP of the circles, absolutely. similar to above actually
                                intensity={20}
                                style={StyleSheet.absoluteFillObject}
                            />
                        </View>





                        <Text style={[styles.qrText, { marginBottom: 14 }]}>
                            Add me on Ripple!
                        </Text>
                        <View style={styles.qrCodeContainer}>
                            <QRCode
                                value={qrCode}
                                size={150}
                                color={colors.black}
                                backgroundColor="white"
                            />
                        </View>
                        <Text style={[styles.qrText, { marginTop: 14, color: 'black' }]}>
                            {userData.name}
                        </Text>

                    </TouchableOpacity>


                    <View style={styles.socialsContainer}>
                        {/* socials container */}
                        <View style={[styles.socialButtonContainer, { marginRight: 29 }]}>
                            <TouchableOpacity style={styles.modalSocialButton}
                                onPress={() => sendProfile(user?.uid)}
                            // style={[styles.modalSocialButton, styles.shadow]}
                            >
                                <Export size={24} color={colors.loginBlue}
                                // weight='bold'
                                />

                            </TouchableOpacity>
                            <Text style={styles.modalSocialText}>
                                Share to...
                            </Text>
                        </View>

                        <View style={[styles.socialButtonContainer]}>
                            <TouchableOpacity
                                style={[styles.modalSocialButton]}
                            >
                                <Link size={24} color={colors.loginBlue}
                                // weight='bold'
                                />

                            </TouchableOpacity>
                            <Text style={styles.modalSocialText}>
                                Copy link
                            </Text>
                        </View>

                    </View>
                </TouchableOpacity>
            </BlurView>
        </Modal >
    )
}


const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 45,
    },
    subContainer: {
        width: '100%',
        marginTop: -70, // lazy, moving it up a little
        backgroundColor: 'white',
        height: 450,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    // modalSocialButton: {
    //     borderRadius: 50,
    //     height: 55,
    //     width: 55,
    //     display: 'flex',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     borderColor: colors.neonBlue,
    //     borderWidth: 1,
    //     backgroundColor: 'white'
    // },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 35,
        zIndex: 9999,
        padding: 10,
    },
    socialsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-end',
        position: 'absolute',
        bottom: 70
    },
    modalSocialText: {
        marginTop: 8,
        fontFamily: 'inter',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        color: 'black'
    },
    socialButtonContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    shadow: {
        shadowColor: colors.accentGray,
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 }
    },
    qrCodeContainer: { borderRadius: 18, height: 200, width: 200, backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    qrText: {
        fontSize: 20,
        fontFamily: 'inter',
        fontWeight: '600',
        color: 'white'
    },

    // circles:
    blurCirclesContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        borderRadius: 20
    },
    circleWrapper: {
        position: 'absolute',
        overflow: 'hidden',
    },
    blurCircle: {
        width: '100%',
        height: '100%',
        opacity: 0.9,
    },
    topCircle: {
        width: 350,
        height: 350,
        borderRadius: 150,
        top: -60,
        right: -60,
    },
    bottomCircle: {
        width: 375,
        height: 375,
        borderRadius: 200,
        bottom: -100,
        left: -100,
    },
    modalSocialButton: {
        backgroundColor: 'white',
        borderColor: colors.darkblue,
        width: 60,
        height: 60,
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.neonBlue,
        shadowOpacity: 0.7,
        shadowRadius: 5,
        shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 }
    }
})
