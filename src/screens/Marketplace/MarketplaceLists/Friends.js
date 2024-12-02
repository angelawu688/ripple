import { FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native"
import ListingCard from "../../../components/ListingCard"
import { colors } from "../../../colors"
import ListingsList from "../../../components/ListingsList"
import { useContext, useEffect, useState } from "react"
import { userContext } from "../../../context/UserContext"
import * as Linking from 'expo-linking'


const Friends = ({ navigation }) => {
    const { userData } = useContext(userContext)
    const [friendsListings, setFriendsListings] = useState([])

    useEffect(() => {
        // grab the friends listings on component mount
    }, [])

    const shareProfile = () => {
        if (!userData?.uid) {
            console.log('gotta wait lol we not loaded')
            return
        }
        const profileLink = Linking.createURL(`user/${userData.uid}`)
        const messageBody = `Follow me on Ripple!\n${profileLink}`
        const smsURL = `sms:&body=${encodeURIComponent(messageBody)}`

        try {
            Linking.openURL(smsURL)
        } catch (e) {
            console.log(e)
        }
        // example dev URL: exp://10.155.102.135:8081/--/user/RsYuNgUxSUTm0xdD0CMi6Yhkjc73 
        // prod urls will look different
        // we will need to use firebase dynamic URLs so that people without the app will be prompted to go download
    }

    // empty
    if (friendsListings?.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.title}>
                    Don't see any items?
                </Text>
                <Text style={styles.subTitle}>
                    Your friend's listings will appear here
                </Text>
                <TouchableOpacity onPress={() => shareProfile()}

                    style={[styles.shadow, styles.button]}>
                    <Text style={[styles.title,]}>
                        Share profile
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
    return (
        // pass in a function to get more ?
        // i.e. onGetMore={getMoreFriendsPosts()} or something
        <ListingsList navigation={navigation} listings={friendsListings} />
    )
}

export default Friends


const styles = StyleSheet.create({
    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: 'white'
    },
    title: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '600',
        textAlign: 'center'
    },
    button: {
        width: 200,
        height: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        marginTop: 15,
    },
    emptyContainer: {
        display: 'flex',
        height: '70%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    subTitle: {
        fontSize: 16,
        fontFamily: 'inter',
        marginVertical: 8
    }
})