import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Image } from 'expo-image'
import { TouchableOpacity } from 'react-native'
import { StyleSheet } from 'react-native'
import { colors } from '../../colors'
import { X } from 'phosphor-react-native'

export default function RecommendationCard({ navigation, recommendedUser, onRemove }) {
    const { mutualCount, user: recommendedUserData } = recommendedUser
    return (
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', {
            userID: recommendedUserData?.id
        })}
            style={styles.container}
        >
            <View style={{ display: 'flex', flexDirection: 'row' }}>
                <Image
                    source={{ uri: recommendedUserData?.pfp }}
                    style={styles.image}
                />

                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: 'black', fontWeight: '500' }]}>
                        {recommendedUserData?.name}
                    </Text>

                    <Text style={[styles.text, { color: colors.loginBlue, fontWeight: '400' }]}>
                        {mutualCount} mutual friend{mutualCount > 1 && 's'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => onRemove(recommendedUserData.id)}>
                <X size={30} color={colors.accentGray} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '100%',
        height: 65,
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    textContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: '100%',
        marginLeft: 15

    },
    image: {
        aspectRatio: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: colors.loginGray
    },
    text: {
        fontSize: 16,
        fontFamily: 'inter',
    }
})