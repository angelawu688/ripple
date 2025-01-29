import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Star } from 'phosphor-react-native'

export default function Reviews() {
    return (
        <View style={styles.container}>

            <Text style={styles.title}>
                Reviews
            </Text>

            <Text style={styles.subtitle}>
                Coming soon!
            </Text>

            <Star size={32} weight='thin' />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    title: {
        fontFamily: 'inter',
        fontWeight: '600',
        fontSize: 16
    },
    subtitle: {
        fontFamily: 'inter',
        fontWeight: '400',
        fontSize: 16
    }
})