import { useContext, useEffect, useState } from "react"
import { userContext } from "../../context/UserContext"
import { ActivityIndicator, View } from "react-native"
import { UserCircle } from "phosphor-react-native"
import UserProfile from "../Marketplace/UserProfile"
import LoadingSpinner from '../../components/LoadingSpinner'

const OwnUserProfile = ({ navigation }) => {
    const { user, userListings } = useContext(userContext)
    const [userID, setUserID] = useState(undefined)

    useEffect(() => {
        setUserID(user.uid)
    }, [user, userListings])

    if (!userID) {
        return (
            <View style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <LoadingSpinner />
            </View>
        )
    }

    return (
        <View style={{ width: '100%', height: '100%' }}>
            <UserProfile navigation={navigation} route={{ params: { userID } }} isOwnProfileInProfileStack={true} />
        </View>

    )
}

export default OwnUserProfile