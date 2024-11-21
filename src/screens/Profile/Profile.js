import { useContext, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { userContext } from "../../context/UserContext";
import { Ionicons } from '@expo/vector-icons';

import { ChatTeardropText, User, Storefront, Bookmark, BookmarkSimple, ShoppingCart, ShareFat } from 'phosphor-react-native';



const Profile = ({ navigation }) => {
    const { user, setUser } = useContext(userContext);
    const handleLogout = () => {
        setUser(null)
    }

    const handleDeleteAccount = () => {
        console.log('deleted user (not actually)')
        setUser(null)
    }

    return (
        <View style={styles.container}>
            {/* Your account */}
            <View>
                {/* account center */}
                <Text style={styles.title}>
                    Your account
                </Text>

                <TouchableOpacity style={styles.profileCard}
                    onPress={() => navigation.navigate('PersonalInformation')}
                >
                    <View style={styles.profileCardLeft}>
                        {/* profile icon placeholder */}
                        <User size={24} color={'black'} style={styles.icon} />
                        {/* <Ionicons name={'person-outline'} size={24} color={'black'} style={styles.icon} /> */}
                        <Text style={{ fontSize: 18, marginLeft: 6 }}>
                            Account Center
                        </Text>
                    </View>

                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>
            </View>

            {/* Storage */}
            <View>
                <Text style={styles.title}>
                    Storage
                </Text>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('SavedItems')}
                >
                    <View style={styles.profileCardLeft}>
                        <BookmarkSimple size={24} color={'black'} style={styles.icon} />
                        {/* <Ionicons name={'bookmark-outline'} size={24} color={'black'} style={styles.icon} /> */}
                        <Text style={styles.cardText}>
                            Saved listings
                        </Text>
                    </View>

                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('YourListings')}>
                    <View style={styles.profileCardLeft}>
                        <Storefront size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Your listings
                        </Text>
                    </View>

                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('SoldItems')}
                >
                    <View style={styles.profileCardLeft}>
                        <ShoppingCart size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Sold tems
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>
            </View >

            {/* About */}
            < View >
                <Text style={styles.title}>
                    About Ripple
                </Text>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => console.log('OPEN WEB URL TO LINK')}
                >

                    <View style={styles.profileCardLeft}>
                        <ShareFat size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Join our email list
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => console.log('OPEN WEB URL TO LINK')}
                >
                    <View style={styles.profileCardLeft}>
                        <ShareFat size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Feedback form
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => console.log('OPEN WEB URL TO LINK')}
                >
                    <View style={styles.profileCardLeft}>
                        <ShareFat size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            About Us
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>

            </View >

            {/* Delete Account, log out */}
            < View >
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={(() => handleLogout())}
                >
                    <View style={styles.profileCardLeft}>
                        <Ionicons name={'exit-outline'} size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Logout
                        </Text>
                    </View>
                    {/* need this for formatting */}
                    <View />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={(() => handleDeleteAccount())}
                >
                    <View style={styles.profileCardLeft}>
                        <Ionicons name={'trash-outline'} size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Delete account
                        </Text>
                    </View>
                    {/* need this for formatting */}
                    <View />
                </TouchableOpacity>
            </View >
        </View >
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
        width: '90%',
        paddingVertical: 12,
        paddingBottom: 20,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center'
    },
    profileCardContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 40,
        marginTop: 40,
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        borderColor: '#F2F0F0',
        height: 60
    },
    cardText: {
        fontSize: 18,
    },
    profileCard: {
        width: '100%',
        height: 45,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F2F0F0',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 5
    },
    icon: {
        marginLeft: 16,
        marginRight: 20
    },
    profileCardLeft: { flexDirection: 'row', alignItems: 'center', height: 50 },
    title: {
        fontSize: 16,
        fontFamily: 'inter',
        fontWeight: '500',
        marginBottom: 12
    }

})