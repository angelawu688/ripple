import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { colors } from '../../constants/colors'


const SKELETON_COUNT = 12


const ConversationsSkeletonLoader = () => {
    // Render 5–6 placeholder rows, or whatever number you prefer

    return (
        <View style={styles.skeletonContainer}>
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <View style={styles.row} key={index}>
                    {/* Avatar Circle */}
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.avatarSkeleton}
                    />
                </View>
            ))}
        </View>
    )
}

export default ConversationsSkeletonLoader

const styles = StyleSheet.create({
    skeletonContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,

    },
    avatarSkeleton: {
        width: '100%',
        height: 50,
        // borderRadius: 25,
        backgroundColor: colors.skeletonGray,
        marginRight: 12,
        borderRadius: 8
    },
})
