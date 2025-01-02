import { Ionicons } from "@expo/vector-icons"
import { PaperPlaneTilt, Storefront } from "phosphor-react-native"
import { Text, TouchableOpacity, View } from "react-native"
import { StyleSheet } from "react-native"
import { colors } from "../../constants/colors"

export function OtherUserButtons({ isSaved, handleSendHi, handleSavePost, shareListing }) {
    return (
        <View style={styles.sectionContainer}>
            <TouchableOpacity onPress={() => handleSendHi()}
                style={styles.touchableContainer}>
                <View style={styles.messageContainer}>
                    <Storefront color='black' size={28} />
                    <Text style={styles.messageText}>
                        "Hi, is this still available?"
                    </Text>
                </View>

                <View
                    style={[styles.sendContainer, styles.shadow]}
                >
                    <Text style={styles.sendText}>Send</Text>
                </View>

            </TouchableOpacity>

            <View style={styles.bottomButtonContainer}>

                <TouchableOpacity style={styles.bottomButton} onPress={() => shareListing()}>
                    <PaperPlaneTilt size={26} color="black" />
                    <Text style={{ marginLeft: 12, fontFamily: 'inter', fontSize: 18 }}>
                        Share
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleSavePost()}
                    style={styles.bottomButton}
                >
                    {isSaved ? (
                        <Ionicons name="bookmark" size={24} color="#000" />
                    ) : (
                        <Ionicons name="bookmark-outline" size={24} color="#000" />
                    )}
                    <Text style={{ marginLeft: 12, fontFamily: 'inter', fontSize: 18 }}>
                        Save
                    </Text>
                </TouchableOpacity>
            </View>
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
    touchableContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderWidth: 1,
        borderColor: '#F2F0F0',
        paddingHorizontal: 12,
        borderRadius: 13
    },
    messageContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageText: {
        marginLeft: 20,
        fontFamily: 'inter',
        fontSize: 18
    },
    sendContainer: {
        height: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 13,
        backgroundColor: colors.neonBlue,
        paddingHorizontal: 10
    },
    sendText: {
        fontSize: 14,
        fontFamily: 'inter',
        fontWeight: '600',
        color: "white"
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
})