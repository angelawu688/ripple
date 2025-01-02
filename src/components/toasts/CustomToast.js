import { View, Text, Animated, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useRef } from 'react'
import { ToastContext } from '../../context/ToastContext'
import { colors } from '../../constants/colors'

export default function Toast() {
    const { isToastVisible, toastMessage } = useContext(ToastContext)
    const fadeAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        // the fade animation works by bringing the opacity from 0 -- > 1 --> 0
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
            style={[styles.toastContainer, { opacity: fadeAnim }]}
        >
            <Text style={styles.toastText}>
                {toastMessage}
            </Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 75,
        borderRadius: 8,
        width: 300,
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: colors.neonBlue,
        zIndex: 999999,
        borderWidth: 1,
        padding: 15,
        left: '50%',
        transform: [{ translateX: '-50%' }],
    },
    toastText: {
        color: 'black',
        textAlign: "center",
        fontFamily: 'inter',
        fontSize: 18
    }
})