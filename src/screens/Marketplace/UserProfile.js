import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, } from "react-native";

import FullLoadingScreen from "../shared/FullLoadingScreen";
import ListingsList from '../../components/listings/ListingsList'
import { Check, DotsThree, EnvelopeSimple, Plus, QrCode, User } from "phosphor-react-native";
import { colors } from "../../constants/colors";
import ListingCard from "../../components/listings/ListingCard";
import * as Linking from 'expo-linking'
import ShareModal from "../../components/ShareModal";
import { ToastContext } from "../../context/ToastContext";
import ProfileSocials from "../../components/profile/ProfileSocials";
import { useProfileData } from "../../hooks/useProfileData";
import {ThreeDotsUserModal} from "../../components/profile/ThreeDotsUserModal";
import ReportUserModal from "../../components/ReportUserModal";

const UserProfile = ({ navigation, route, isOwnProfileInProfileStack = false }) => {
    const { userID } = route.params
    const { showToast } = useContext(ToastContext);
    const {
        isLoading,
        userProfile,
        userPosts,
        isOwnProfile,
        followingUser,
        handleFollowToggle,
        handleFollowers,
        handleFollowing,
        handleMessage
    } = useProfileData(userID);

    const [shareModalVisible, setShareModalVisible] = useState(false)
    const [reportModalVisible, setReportModalVisible] = useState(false) // report modal
    const [modalVisible, setModalVisible] = useState(false) // 3 dots modal
    const [profileLink, setProfileLink] = useState('');
    useEffect(() => {
        if (userID) {
            const link = Linking.createURL(`user/${userID}`);
            setProfileLink(link);
        }
    }, [userID]);


    if (isLoading) {
        return <FullLoadingScreen />
    }

    if (!userProfile) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'inter', fontWeight: '600', fontSize: 20 }}>
                    User not found!
                </Text>
                <Text style={{ fontFamily: 'inter', fontWeight: '400', fontSize: 14 }}>
                    This account may have been deleted
                </Text>
            </View>
        )
    }

    return (
        <View style={[styles.container]}>
            {isOwnProfileInProfileStack && <View style={{ height: 80, width: '100%' }} />}
            <View style={styles.topContainer}>
                {userProfile.pfp ? (<Image
                    // pfp would go here
                    style={{ width: 60, height: 60, borderRadius: 75, backgroundColor: 'gray' }}
                    source={{ uri: userProfile?.pfp }}

                />) :
                    (<View style={{ backgroundColor: colors.loginGray, width: 60, height: 60, borderRadius: 75, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        <User size={24} />
                    </View>)
                }
                <View style={styles.headerTextContainer}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.nameText}
                    >
                        {userProfile?.name || "Anonymous"}
                    </Text>
                    <Text style={styles.netIDText}>
                        {userProfile?.email || "mystery@uw.edu"}
                    </Text>
                </View>

                {/* navigation to other  */}
                {isOwnProfileInProfileStack ? (
                    <TouchableOpacity
                        style={{
                            position: 'absolute', right: 20,
                            top: 5
                        }}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {/* <Gear size={30} /> */}
                        <DotsThree size={30} weight="bold" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={{
                            position: 'absolute', right: 20,
                            top: 5
                        }}
                        onPress={() => setModalVisible(true)}
                    >
                        {/* <Gear size={30} /> */}
                        <DotsThree size={30} weight="bold" />
                    </TouchableOpacity>
                )}
                <ThreeDotsUserModal
                    visible={modalVisible}
                    onReport={() => setReportModalVisible(true)}
                    onClose={() => setModalVisible(false)}
                />

                <ReportUserModal // TODO: not displayed correctly!! need to move it lower so you can still see the three dots
                    visible={reportModalVisible}
                    onClose={() => {
                        setReportModalVisible(false)
                        setModalVisible(false)
                    }}
                    userId={userID}
                />
            </View>

            <ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
                style={styles.scrollContainer}
            >
                <View style={{ paddingHorizontal: 25, display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={[{ width: '100%', display: 'flex', backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16, },]}>

                        {isOwnProfile ? (
                            <TouchableOpacity style={[styles.followButton, styles.shadow, { shadowColor: followingUser ? colors.neonBlue : colors.accentGray }]}
                                onPress={handleFollowers}
                            >
                                <Text style={[styles.followText, { color: followingUser ? colors.neonBlue : colors.accentGray }]}>
                                    Followers
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.followButton, styles.shadow, { shadowColor: followingUser ? colors.neonBlue : colors.accentGray }]}
                                onPress={handleFollowToggle}
                            >

                                {followingUser ? <Check size={18} color={followingUser ? colors.neonBlue : colors.accentGray} /> : <Plus size={18} color={colors.accentGray} />}
                                <Text style={[styles.followText, { color: followingUser ? colors.neonBlue : colors.accentGray }]}>
                                    Follow{followingUser && 'ing'}
                                </Text>
                            </TouchableOpacity>)}

                        {isOwnProfile ? (<TouchableOpacity style={[styles.followButton, styles.shadow]}
                            onPress={handleFollowing}
                        >
                            <Text style={[styles.followText, { backgroundColor: 'white' }]}>
                                Following
                            </Text>
                        </TouchableOpacity>) : (<TouchableOpacity style={[styles.followButton, styles.shadow]}
                            onPress={() => handleMessage(userID)}
                        >
                            <EnvelopeSimple size={18} color={colors.accentGray} />
                            <Text style={[styles.followText, { backgroundColor: 'white' }]}>
                                Message
                            </Text>
                        </TouchableOpacity>)}
                    </View>

                    <View style={styles.bioContainer}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', }}>
                            <View >
                                <Text style={styles.majorText}>
                                    {userProfile.major}
                                </Text>
                                {userProfile?.concentration && (
                                    <Text style={{ fontFamily: 'inter', fontSize: 16, color: colors.accentGray, fontWeight: '500' }}>
                                        {userProfile.concentration}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.majorText}>
                                {userProfile.gradYear}
                            </Text>
                        </View>

                        {userProfile?.bio && (<View style={{ marginTop: 12, width: '100%', maxHeight: 128, marginBottom: 0 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                                {userProfile.bio}
                            </Text>
                        </View>)}

                        <ProfileSocials userProfile={userProfile} />

                        <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600', alignSelf: 'flex-start', marginBottom: 0, marginTop: 20 }}>
                            Listings
                        </Text>

                    </View>
                </View>

                {userPosts && userPosts.length > 0 ? (userPosts.length === 1 ? (<View style={{ width: '50%', alignSelf: 'flex-start' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ListingScreen', { listingID: userPosts[0].id })}
                    >
                        <ListingCard
                            listing={userPosts[0]}
                            disabled={!isOwnProfile && userPosts[0].sold}
                        />
                    </TouchableOpacity>

                </View>) : (<View style={{
                    width: '100%',
                }}>
                    <ListingsList
                        listings={userPosts}
                        navigation={navigation}
                        scrollEnabled={false}
                        isOwnProfile={isOwnProfile}
                    />
                </View>)) : (
                    <View style={{ alignSelf: 'flex-start' }}>
                        <Text style={{ fontFamily: 'inter', fontSize: 16, fontWeight: '400', marginLeft: 25 }}>
                            {isOwnProfile ? 'You have ' : 'User has '}no listings
                        </Text>
                        {isOwnProfile && <Text style={{ fontFamily: 'inter', fontSize: 16, fontWeight: '400', marginLeft: 25 }}
                        >
                            Make a post to get started!
                        </Text>}
                    </View>
                )}
            </ScrollView >

            {isOwnProfile && (
                <TouchableOpacity style={{ backgroundColor: 'white', borderColor: colors.darkblue, width: 60, height: 60, borderRadius: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', shadowColor: colors.neonBlue, shadowOpacity: 0.35, shadowRadius: 5, position: 'absolute', bottom: 15, right: 15, shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 } }}
                    onPress={() => {
                        setShareModalVisible(true)
                    }}
                >
                    <QrCode color={colors.darkblue} size={30} />
                </TouchableOpacity>
            )}

            <ShareModal isVisible={shareModalVisible} setShareModalVisible={setShareModalVisible} profileLink={profileLink} />
        </View >
    )

}

export default UserProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignSelf: 'center',
        paddingHorizontal: 1
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: 25
    },
    headerTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: 12,
        marginBottom: 6,
        maxWidth: '70%',
        height: 60,
    },
    nameText: {
        fontSize: 22,
        fontWeight: '600',
        fontFmaily: 'inter'
    },
    netIDText: {
        fontSize: 17,
        fontWeight: '400',
        color: colors.accentGray,
        fontFmaily: 'inter'
    },
    bioContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: 12,
        width: '100%',
        marginTop: 4
    },
    socials: {
        flexDirection: 'column',
        marginTop: 16,
        width: '100%',
        justifyContent: 'space-between',
        // height: 60
    },
    followText: {
        marginLeft: 4,
        fontSize: 15,
        fontFamily: 'inter',
        color: colors.accentGray
    },
    followButton: {
        width: '45%',
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: 'white',
    },
    shadow: {
        shadowColor: colors.accentGray,
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 }
    },
    majorText: {
        fontFamily: 'inter',
        fontSize: 18,
        fontWeight: '600',
        color: colors.uwPurple
    },
    socialContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    socialText: {
        marginLeft: 8,
        fontSize: 17,
        fontFamily: 'inter',
        color: colors.loginBlue,
        maxWidth: '80%',
    },
})
