import { PencilSimple, Tag } from "phosphor-react-native"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { colors } from "../../constants/colors"

export function OwnPostButtons({
    handleEditListing, handleMarkAsSold, postSold
}) {
    return (
        <View style={styles.isOwnPostContainer}>
            <TouchableOpacity
                onPress={() => handleEditListing()}
                style={[{ width: '32%' }, styles.ownPostBottomButton]}
            >
                <PencilSimple color={colors.black} />
                <Text style={styles.ownPostBottomButtonText}>
                    Edit
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => handleMarkAsSold()}
                style={[{ width: '64%' }, styles.ownPostBottomButton]}

            >
                <Tag color={colors.black} />
                <Text style={styles.ownPostBottomButtonText}>
                    Mark item as {postSold ? 'Active' : 'Sold'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    isOwnPostContainer: {
        width: '100%',
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25
    },
    ownPostBottomButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.loginGray,
        height: 40,
        borderRadius: 13,
        flexDirection: 'row'
    },
    ownPostBottomButtonText: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '400',
        marginLeft: 21
    },

})