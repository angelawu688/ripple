import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ForYou from "./MarketplaceLists/ForYou";
import { Ionicons } from "@expo/vector-icons";


const UserProfile = ({ navigation, route }) => {
    const { userID } = route.params
    const [followingUser, setFollowingUser] = useState(false)

    // grab the profile from the backend by the userID. Below is for testing
    const [testUser, setTestUser] = useState({
        pfp: undefined,
        name: 'Alex Smith',
        netID: 'asmith@uw.edu',
        major: 'info',
        concentration: 'hci',
        gradYear: '2025',
        instagram: 'alex.smith',
        linkedin: 'SOME URL HERE',
        bio: "Jonah Coleman's favorite arist is EBK Yeebo. You should check him out",
        posts: testUserPosts
    })

    const testUserPosts = [
        { listingID: 1, img: undefined, title: 'Sony Camera', price: 10, sold: false },
        { listingID: 2, img: undefined, title: 'Street Bike', price: 50, sold: false },
        { listingID: 3, img: undefined, title: 'Nintendo Switch', price: 80, sold: false },
        { listingID: 4, img: undefined, title: 'Airpod Pros', price: 50, sold: true },
        { listingID: 5, img: undefined, title: 'Catan Set', price: 10, sold: true },
    ]

    const handleFollow = () => {
        setFollowingUser(!followingUser)
        // BACKEND CHANGES HERE
    }

    const handleMessage = () => {
        console.log('gonna implement soon')
    }


    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                {testUser.pfp ? (<Image
                // pfp would go here

                />) :
                    (<View style={{ backgroundColor: 'gray', width: 75, height: 75, borderRadius: 75 }} />)
                }
                <View style={styles.headerTextContainer}>
                    <Text style={styles.nameText}>
                        {testUser.name}
                    </Text>
                    <Text style={styles.netIDText}>
                        {testUser.netID}
                    </Text>
                </View>
            </View>



            <View style={styles.bioContainer}>
                <Text style={{ fontSize: 16, color: 'black', fontFamily: 'inter', fontWeight: '500', marginTop: 10, }}>
                    {testUser.gradYear} | {testUser.major} | {testUser.concentration}
                </Text>
                <View style={styles.socials}>
                    <TouchableOpacity style={styles.socialBubblePlaceholder}
                        onPress={() => console.log('open instagram')}
                    />
                    <TouchableOpacity style={styles.socialBubblePlaceholder}
                        onPress={() => console.log('open linkedin')}
                    />
                    <TouchableOpacity style={styles.socialBubblePlaceholder}
                        onPress={() => console.log('open x')}
                    />
                </View>
                <Text style={{ fontSize: 14, color: 'black', fontFamily: 'inter', fontWeight: '400', marginTop: 10, }}>
                    {testUser.bio}
                </Text>
            </View>

            <View style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
                <TouchableOpacity style={styles.followButton}
                    onPress={() => handleFollow()}
                >

                    {followingUser ? <Ionicons name='checkmark' size={18} /> : <Ionicons name='add' size={18} />}


                    <Text style={styles.followText}>
                        Follow{followingUser && 'ing'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.followButton}
                    onPress={() => handleMessage()}
                >
                    <Ionicons name='mail-outline' size={18} />
                    <Text style={styles.followText}>
                        Message
                    </Text>
                </TouchableOpacity>
            </View>





            <ForYou listings={testUserPosts} naviigation={navigation} />




        </View>
    )

}

export default UserProfile;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        alignSelf: 'center'
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 12

    },
    nameText: {
        fontSize: 24,
        fontWeight: '600',
        fontFmaily: 'inter'
    },
    netIDText: {
        fontSize: 16,
        fontWeight: '500',
        color: 'gray',
        fontFmaily: 'inter'
    },
    bioContainer: {
        width: '90%',
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    socials: {
        flexDirection: 'row',
        marginTop: 10
    },
    socialBubblePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 50,
        backgroundColor: 'red',
        marginRight: 10,
    },
    followText: { marginLeft: 4, fontSize: 15, fontFamily: 'inter' },
    followButton: { width: '50%', height: 30, borderWidth: 1, borderColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }
})
