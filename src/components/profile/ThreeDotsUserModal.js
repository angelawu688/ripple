import { StyleSheet, TouchableWithoutFeedback, View, Text, TouchableOpacity } from "react-native"
import { colors } from "../../constants/colors"
import { blockUser, checkIfBlocked, unblockUser } from "../../utils/blockUser"
import { useContext, useEffect, useState } from "react"
import { userContext } from "../../context/UserContext"
import { ToastContext } from "../../context/ToastContext"
import { useNavigation } from "@react-navigation/native"

export function ThreeDotsUserModal({
    visible,
    onReport,
    userID,
    onClose
}) {
    const { user } = useContext(userContext)
    const { showToast } = useContext(ToastContext)
    const navigation = useNavigation();
    const [isBlocked, setIsBlocked] = useState(false)

    useEffect(() => {
        const checkBlock = async () => {
            try {
                const blocked = await checkIfBlocked(user.uid, userID)
                setIsBlocked(blocked)
            } catch (e) {
                console.error(e)
            }
        }
        checkBlock()
    }, [])

    const handleBlockUser = async () => {
        try {
            await blockUser(user.uid, userID)
            onClose()
            // back navigate
            navigation.goBack()
            showToast('User blocked!')
        } catch (e) {
            console.log(e)
            showToast('Error blocking user', 'error')
        }
    }

    const handleUnblockUser = async () => {
        try {
            await unblockUser(user.uid, userID)
            onClose()
            showToast('Unblocked user')
        } catch (e) {
            showToast('Error unblocking user', 'error')
        }
    }


    if (!visible) {
        return null
    }

    return (
        <TouchableWithoutFeedback
            style={styles.modalBackdrop}
            onPress={onClose} // Dismiss modal on backdrop press
        >
            <View style={styles.modalContainer}>
                {!isBlocked && <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => handleBlockUser()}>
                    <Text style={[styles.modalText, { color: 'red' }]}>Block User</Text>
                </TouchableOpacity>}

                {isBlocked && <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => handleUnblockUser()}>
                    <Text style={[styles.modalText, { color: colors.loginBlue }]}>Unblock User</Text>
                </TouchableOpacity>}
                <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={onReport}>
                    <Text style={[styles.modalText, { color: 'red' }]}>Report User</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback >
    )
}


const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 30,
        right: 10,
        width: 150,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        paddingVertical: 4,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 9999
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.loginGray,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
    },
})