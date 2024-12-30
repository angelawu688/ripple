import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { colors } from '../constants/colors'
import { MapPin } from 'phosphor-react-native'

export default function UWHeader() {
    const totalUsers = '2.3k'
    return (
        <View style={styles.collegeHeaderContainer}>

            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: 8, }}>
                    <MapPin size={24} weight={'fill'} color={colors.uwPurple} />

                </View>

                <Text style={[styles.tabTextStyle, { color: colors.uwPurple }]}>University of Washington</Text>
            </View>
            <Text style={{ color: colors.darkgray, fontSize: 14, fontFamily: 'inter' }}>{totalUsers} users</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    collegeHeaderContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingBottom: 10
    },
    iconPlaceholder: {
        width: 30,
        height: 30,
        backgroundColor: 'black'
    },
    tabTextStyle: {
        fontSize: 18,
        fontFamily: 'inter',
    },
})