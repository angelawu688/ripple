import { View, Text, Animated, StyleSheet, PanResponder } from 'react-native'
import React, { useContext, useEffect, useRef } from 'react'
import { ToastContext } from '../../context/ToastContext'
import { colors } from '../../constants/colors'
import { Link } from 'phosphor-react-native'

const DISMISSAL_THRESHOLD = 50

export default function Toast() {
    const { isToastVisible, toastMessage, type, hideToast } = useContext(ToastContext)
    const fadeAnim = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(0)).current

    // handles motion for dismissing the toast
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {

                if (gestureState.dy < 0) {
                    translateY.setValue(gestureState.dy)
                }
            },
            // only dismiss if we reach the dismissal threshold
            // otherwise reset position
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy < -1 * DISMISSAL_THRESHOLD) {

                    Animated.parallel([
                        Animated.timing(translateY, {
                            toValue: -200,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        })
                    ]).start(() => {
                        hideToast()
                        translateY.setValue(0)
                    })
                } else {
                    // reset position if not far enough
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start()
                }
            },
        })
    ).current


    useEffect(() => {
        // the fade animation works by bringing the opacity from 0 -- > (in) 1 --> (out) 0
        if (isToastVisible) { // fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else { // fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isToastVisible, fadeAnim])


    // if not visible and done fading, return nothing
    // the get value ensures that we get a nice fade out
    if (!isToastVisible && fadeAnim.__getValue() === 0) {
        return null;
    }

    return (
        <Animated.View
            style={[styles.toastContainer, {
                opacity: fadeAnim,
                transform: [
                    { translateX: -180 }, // half of the width (360)
                    { translateY: translateY }
                ]
            }]}

            {...panResponder.panHandlers}
        >
            {type === 'link' && <View style={{ marginRight: 10 }}><Link size={28} color={colors.loginBlue} /></View>}

            <Text style={[
                styles.toastText,
                { color: type === 'link' && colors.loginBlue },
                { color: type === 'error' && colors.errorMessage }
            ]}>
                {toastMessage}
            </Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 75,
        borderRadius: 16,
        width: 360,
        height: 50,
        alignItems: 'center',
        backgroundColor: colors.lightgray,
        // borderWidth: 1,
        // borderColor: colors.neonBlue,
        zIndex: 999999,
        padding: 15,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        flexDirection: 'row',
        justifyContent: 'center'
    },
    toastText: {
        color: 'black',
        fontWeight: '700',
        textAlign: "center",
        fontFamily: 'rubik',
        fontSize: 18
    }
})