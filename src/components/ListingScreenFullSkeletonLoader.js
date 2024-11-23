
import { MotiView } from 'moti'
import { Dimensions, View, StyleSheet } from 'react-native'
import { colors } from '../colors'

const { width } = Dimensions.get('window')


const ListingsListSkeletonLoaderFull = () => {
    return (
        <View style={styles.container}>
            {/* in the real component this is a flatlist but this is so chill */}
            <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.7 }}
                transition={{
                    type: 'timing',
                    duration: 750,
                    loop: true,
                }}
                style={styles.photoSkeleton}
            />

            {/* title and prices */}
            <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.titleSkeleton}
                    />
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.priceSkeleton}
                    />
                </View>

            </View>

            {/* profile */}
            <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.profilePictureSkeleton}
                    />
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.nameSkeleton}
                    />
                </View>
            </View>

            {/* buttons */}
            <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.upperButton}
                    />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.lowerButton}
                    />
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.7 }}
                        transition={{
                            type: 'timing',
                            duration: 750,
                            loop: true,
                        }}
                        style={styles.lowerButton}
                    />
                </View>
            </View>


        </View>
    )
}

export default ListingsListSkeletonLoaderFull;



const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    priceNameContainer: {
        alignSelf: 'center',
        width: '95%',
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    sectionContainer: {
        width: '92%',
        alignSelf: 'center',
        flexDirection: 'column',
        marginTop: 16
    },
    bottomButton: {
        display: 'flex',
        width: '47%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderWidth: 1,
        borderColor: '#F2F0F0',
        borderRadius: 13,
        paddingHorizontal: 4,

    },
    bottomButtonContainer: {
        width: '100%',
        display: 'flex', justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        marginTop: 12,
    },

    // skeleton styles
    titleSkeleton: {
        width: '60%',
        height: 35,
        backgroundColor: colors.skeletonGray,
        borderRadius: 4,
        marginBottom: 8,
    },
    priceSkeleton: {
        width: '15%',
        height: 35,
        backgroundColor: colors.skeletonGray,
        borderRadius: 4,
    },
    profilePictureSkeleton: {
        width: 60,
        height: 60,
        backgroundColor: colors.skeletonGray,
        borderRadius: 60,
        marginRight: 12,
    },
    photoSkeleton: {
        width: width,
        height: width,
        backgroundColor: colors.skeletonGray,
    },
    nameSkeleton: {
        width: '60%',
        height: 60,
        backgroundColor: colors.skeletonGray,
        borderRadius: 4,
        marginBottom: 8,
    },
    upperButton: {
        width: '100%',
        height: 40,
        backgroundColor: colors.skeletonGray,
        borderRadius: 8,
        marginBottom: 12
    },
    lowerButton: {
        width: '48.75%',
        height: 40,
        backgroundColor: colors.skeletonGray,
        borderRadius: 8
    }

})