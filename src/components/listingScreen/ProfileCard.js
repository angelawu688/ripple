import { User } from "phosphor-react-native"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors } from "../../constants/colors"
import { formatDate } from "../../utils/formatDate"

export function ProfileCard({ navigation, userPfp, sellerID, userName, createdAt }) {
    return (
        <View style={styles.sectionContainer}>
            <TouchableOpacity onPress={() => {
                navigation.navigate('UserProfile', { userID: sellerID })
            }}
                style={styles.imageContainer}>
                {userPfp ? (
                    <Image
                        source={{ uri: userPfp }}
                        // this will allow for use of qr codes and copy pasting text
                        enableLiveTextInteraction={true}
                        style={styles.pfp}
                    />
                ) : (
                    <View
                        style={styles.placeHolderPfpContainer}
                    >
                        <User color='black' size={24} />
                    </View>
                )}

                <View>
                    <Text style={styles.nameText} >
                        {userName || 'Username not found'}
                    </Text>
                    <Text style={styles.dateText} >
                        {formatDate(createdAt?.seconds)}
                    </Text>
                </View>

            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    sectionContainer: {
        width: '100%',
        paddingHorizontal: 15,
        alignSelf: 'center',
        flexDirection: 'column',
        marginTop: 16
    },
    nameText: {
        fontFamily: 'inter',
        fontSize: 18,
        marginLeft: 8,
        color: 'black',
        fontWeight: '500'
    },
    placeHolderPfpContainer: {
        height: 40,
        width: 40,
        borderRadius: 60,
        backgroundColor: colors.loginGray,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    pfp: {
        width: 40,
        height: 40,
        borderRadius: 60
    },
    dateText: {
        fontFamily: 'inter',
        fontSize: 14,
        marginLeft: 8,
        color: colors.accentGray,
        fontWeight: '400'
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%'
    },
})