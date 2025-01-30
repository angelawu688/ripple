import { useContext, useEffect, useState } from "react";
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { userContext } from "../../context/UserContext";
import { Ionicons } from '@expo/vector-icons';

import { ChatTeardropText, User, Storefront, Bookmark, BookmarkSimple, ShoppingCart, ShareFat } from 'phosphor-react-native';
import { deleteAccount } from "../../utils/firebaseUtils";
import { colors } from "../../constants/colors";
import { openLink } from "../../utils/socialUtils";
import { links } from "../../constants/links";
import { ToastContext } from "../../context/ToastContext";



const Profile = ({ navigation }) => {
    const { user, setUser, handleSignOut } = useContext(userContext);
    const { showToast } = useContext(ToastContext)
    const [loading, setLoading] = useState(false)

    const handleLogout = async () => {
        try {
            setLoading(true)
            await handleSignOut()
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const openURL = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url)
            } else {
                Alert.alert('Error', "Can't open URL")
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleDeleteAccount = () => {
        Alert.alert('Delete Account',
            'Are you sure? This action cannot be undone',
            [
                {
                    text: 'Cancel',
                    onPress: null,
                    style: 'cancel'
                },
                {
                    text: 'Delete Account',
                    onPress: async () => {
                        try {
                            await deleteAccount(user.uid, setUser)
                        } catch (e) {
                            console.error(e)
                        }
                    },
                    style: 'destructive'
                }
            ]
        )

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
                        <Text style={{ fontSize: 18, }}>
                            Edit Profile
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
                {/*todo: consolidate sold items and your listings*/}
                {/* <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('SoldItems')}
                >
                    <View style={styles.profileCardLeft}>
                        <ShoppingCart size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Sold Items
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity> */}
            </View >

            {/* About */}
            < View >
                <Text style={styles.title}>
                    Help Ripple
                </Text>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => openURL('https://www.rippleu.net/')}
                >
                    <View style={styles.profileCardLeft}>
                        <ShareFat size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            About Us
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => openLink('https://docs.google.com/forms/d/152g3n-uab50ng3INshD7WwNLIsMhWaZSyWQwVZIeCeM/edit', showToast)}
                >
                    <View style={styles.profileCardLeft}>
                        <ShareFat size={24} color={'black'} style={styles.icon} />
                        <Text style={styles.cardText}>
                            Feedback form
                        </Text>
                    </View>
                    <Ionicons name={'chevron-forward'} size={24} color={'black'} />
                </TouchableOpacity>

                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        style={[styles.profileCard, { width: '48%', justifyContent: 'center' }]}
                        onPress={() => openLink(links.privacyPolicy, showToast)}
                    >
                        <Text style={[styles.cardText, { fontSize: 16 }]}>
                            Privacy Policy
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.profileCard, { width: '48%', justifyContent: 'center' }]}
                        onPress={() => openLink(links.termsOfService, showToast)}
                    >


                        <Text style={[styles.cardText, { fontSize: 15 }]}>
                            Terms of Service
                        </Text>
                    </TouchableOpacity>
                </View>
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
                            Log out
                        </Text>
                    </View>
                    {/* need this for formatting */}
                    <View />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={(() => {
                        handleDeleteAccount()
                    })}
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
        alignSelf: 'center',
        paddingTop: 20
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
        paddingRight: 5,
        backgroundColor: colors.mediumGray
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