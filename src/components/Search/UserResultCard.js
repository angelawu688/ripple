import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { colors } from '../../colors'
import { Image } from 'react-native'

export default function UserResultCard({ navigation, user }) {
    const { pfp, name, major } = user
    const userID = user.uid

    return (
        <TouchableOpacity style={styles.container}
            onPress={() => navigation.navigate('UserProfile', {
                userID: userID
            })}
        >
            <Image
                style={{ width: 50, height: 50, backgroundColor: colors.loginGray, borderRadius: 50 }}
                source={{ uri: pfp }}
            />
            <View style={styles.textContainer}>
                <Text style={styles.nameText}>
                    {name}
                </Text>
                <Text style={styles.majorText}>
                    {major}
                </Text>
            </View>

        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '96%',
        flexDirection: 'row',
        alignSelf: 'center'

    },
    textContainer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', marginLeft: 10 },
    nameText: { fontSize: 16, fontWeight: '500', fontFamily: 'inter' },
    majorText: { fontSize: 16, fontWeight: '400', fontFamily: 'inter', color: colors.loginBlue },
})