import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, Pressable, FlatList, } from "react-native";

import FullLoadingScreen from "../shared/FullLoadingScreen";
import ListingsList from '../../components/listings/ListingsList'
import { CaretRight, Check, DotsThree, EnvelopeSimple, Plus, QrCode, Star, User } from "phosphor-react-native";
import { colors } from "../../constants/colors";
import ListingCard from "../../components/listings/ListingCard";
import * as Linking from 'expo-linking'
import ShareModal from "../../components/ShareModal";
import { ToastContext } from "../../context/ToastContext";
import ProfileSocials from "../../components/profile/ProfileSocials";
import { useProfileData } from "../../hooks/useProfileData";
import { ThreeDotsUserModal } from "../../components/profile/ThreeDotsUserModal";
import ReportUserModal from "../../components/ReportUserModal";
import { unblockUser } from "../../utils/blockUser";
import { userContext } from "../../context/UserContext";
import { useNavigation } from "@react-navigation/native";
import ZoomableImage from "../../components/ZoomableImage";
import ListingSection from "../../components/profile/ListingSection";
import { fetchUserCounts, fetchUserListings } from "../../utils/firebaseUtils";

const UserProfile = ({ navigation, route, isOwnProfileInProfileStack = false }) => {
    const { userID } = route.params
    const { user, savedPosts } = useContext(userContext)
    const { showToast } = useContext(ToastContext);
    const {
        isLoading,
        userProfile,
        userPosts,
        isOwnProfile,
        followingUser,
        isBlocked,
        hasBlocked,
        handleFollowToggle,
        handleFollowers,
        handleFollowing,
        handleMessage,
        refreshProfile
    } = useProfileData(userID);

    const [shareModalVisible, setShareModalVisible] = useState(false)
    const [reportModalVisible, setReportModalVisible] = useState(false) // report modal
    const [modalVisible, setModalVisible] = useState(false) // 3 dots modal
    const [profileLink, setProfileLink] = useState('');

    const [followers, setFollowers] = useState([])

    const [following, setFollowing] = useState([])

    const [activeListings, setActiveListings] = useState([])
    const [soldListings, setSoldListings] = useState([])

    useEffect(() => {
        if (userID) {
            const link = Linking.createURL(`user/${userID}`);
            setProfileLink(link);
        }
        console.log(savedPosts)
    }, [userID]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // COUNTS for followers/following
                const { followers, following } = await fetchUserCounts(userID);
                setFollowers(followers)
                setFollowing(following)

                // LISTINGS sorted into active and sold
                const listings = await fetchUserListings(userID);
                setActiveListings(listings.activeListings);
                setSoldListings(listings.soldListings);
            } catch (e) {
                console.error('Error fetching user data:', e);
                showToast?.('Failed to load user data');
            }
        };

        fetchData();
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

    if (isBlocked) {
        return (
            <View style={styles.blockedContainer}>
                <Text style={styles.topBlockedText}>
                    This user has blocked you
                </Text>
                <Text style={styles.bottomBlockedText}>
                    You are not able to see their content
                </Text>
            </View>
        )
    }

    return (
        <View style={[styles.container]}>
            {isOwnProfileInProfileStack && <View style={{ height: 60, width: '100%' }} />}
            <View style={styles.topContainer}>
                <View style={styles.headerTextContainer}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.nameText}
                    >
                        {userProfile?.name || "Anonymous"}
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
                        onPress={() => setModalVisible(prev => !prev)}
                    >
                        {/* <Gear size={30} /> */}
                        <DotsThree size={30} weight="bold" />
                    </TouchableOpacity>
                )}
                <ThreeDotsUserModal
                    visible={modalVisible}
                    onReport={() => setReportModalVisible(true)}
                    onClose={() => setModalVisible(false)}
                    userID={userID}
                />

                <ReportUserModal
                    visible={reportModalVisible}
                    onClose={() => {
                        setReportModalVisible(false)
                        setModalVisible(false)
                    }}
                    userId={userID}
                />

            </View>

            {!hasBlocked ? (<ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}
                style={styles.scrollContainer}
            >
                {/* TOP HEADER */}
                <View style={{
                    paddingHorizontal: 12,
                    flex: 1,
                    gap: 16
                }}>
                    {/* pfp and following/followers */}
                    <View style={{ flex: 1, width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                        <Pressable
                            onPress={() => setShareModalVisible(true)}
                            style={{ position: 'relative' }}
                        >
                            {userProfile.pfp ? (
                                <ZoomableImage
                                    disabled={true}
                                    uri={userProfile?.pfp}
                                    thumbnailStyle={{ width: 62, height: 62, borderRadius: 75, backgroundColor: 'gray' }}
                                />
                            ) :
                                (<View style={{ backgroundColor: colors.loginGray, width: 60, height: 60, borderRadius: 75, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                                    <User size={24} />
                                </View>)
                            }
                            {isOwnProfile && (
                                <View style={{ position: 'absolute', bottom: -8, right: -8, zIndex: 4 }}>
                                    <View
                                        style={{
                                            backgroundColor: colors.lightgray,
                                            borderRadius: 20,
                                            padding: 6,
                                            shadowColor: colors.neonBlue,
                                            shadowOpacity: 0.35,
                                            shadowRadius: 3,
                                            shadowOffset: { width: 0, height: 0 }
                                        }}
                                    >
                                        <QrCode color={colors.darkblue} size={22} />
                                    </View>
                                    <ShareModal
                                        isVisible={shareModalVisible}
                                        setShareModalVisible={setShareModalVisible}
                                        profileLink={profileLink}
                                    />
                                </View>
                            )}
                        </Pressable>

                        {/* Reviews */}
                        <Pressable
                            onPress={() => navigation.navigate('Reviews')}
                            style={styles.followingContainer}
                        >
                            {/* <View style={{ flexDirection: 'row' }}>
                                {[0, 1, 2, 3, 4].map((item) => (<Star key={item} size={16} color={'black'} weight="regular" />))}
                            </View> */}
                            <Star size={18} color={'black'} weight="fill" />
                            <Text style={[styles.followingText, { color: colors.loginBlue }]}>
                                Reviews
                            </Text>
                        </Pressable>

                        {/* Followers */}
                        <Pressable
                            onPress={() => {
                                navigation.navigate('Followers', {
                                    isFollowers: true,
                                    followers: followers,
                                    following: following,
                                    isOwnProfile: isOwnProfile,
                                    profileUserId: userID,
                                });
                            }}
                            style={styles.followingContainer}
                        >
                            <Text style={styles.followingText}>
                                {followers?.length ?? '0'}
                            </Text>
                            <Text style={[styles.followingText, { color: colors.loginBlue }]}>
                                Followers
                            </Text>
                        </Pressable>

                        {/* Following */}
                        <Pressable
                            onPress={() => {
                                navigation.navigate('Followers', {
                                    isFollowers: false,
                                    followers: followers,
                                    following: following,
                                    isOwnProfile: isOwnProfile,
                                    profileUserId: userID,
                                });
                            }}
                            style={styles.followingContainer}
                        >
                            <Text style={styles.followingText}>
                                {following?.length || '0'}
                            </Text>
                            <Text style={[styles.followingText, { color: colors.loginBlue }]}>
                                Following
                            </Text>
                        </Pressable>
                    </View>

                    {/* MAJOR */}
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', }}>
                        <View style={{ maxWidth: '80%', flex: 1 }}>
                            <Text style={styles.majorText}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {userProfile.major}
                            </Text>
                            {userProfile?.concentration && (
                                <Text style={{ fontFamily: 'inter', fontSize: 16, color: colors.accentGray, fontWeight: '500' }}
                                    maxWidth={'95%'}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {userProfile.concentration}
                                </Text>
                            )}
                        </View>
                        <Text style={styles.majorText}>
                            {userProfile.gradYear}
                        </Text>
                    </View>

                    {!isOwnProfile && (
                        // Following container
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={styles.followButton}
                                onPress={handleFollowToggle}
                            >
                                <Text style={[styles.followButtonText, followingUser && { color: colors.loginBlue }]}>
                                    {followingUser ? 'Following' : 'Follow'}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleMessage}
                                style={styles.followButton}
                            >
                                <Text style={styles.followButtonText}>
                                    Message
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {/* BIO */}
                    {userProfile?.bio && (<View style={{ width: '100%', maxHeight: 128, marginBottom: 0 }}>
                        <Text style={{ fontSize: 16, fontFamily: 'inter' }}>
                            {userProfile.bio}
                        </Text>
                    </View>)}

                    {/* SOCIALS */}
                    <ProfileSocials userProfile={userProfile} />
                </View>


                {/* saved posts */}
                {isOwnProfile && (
                    <ListingSection
                        navigation={navigation}
                        title="Saved Listings"
                        listings={savedPosts}
                        onViewAll={() => navigation.navigate('SavedItems')}
                    />
                )}

                {/* active listings */}
                {activeListings.length > 0 && <ListingSection
                    navigation={navigation}
                    title="Active Listings"
                    listings={activeListings.slice(0, 4)}
                    onViewAll={() => navigation.navigate('FullListingsScreen', {
                        listings: activeListings,
                        mode: 'active',
                        title: 'Active Listings'
                    })}
                />}

                {/* sold listings */}
                {soldListings.length > 0 && <ListingSection
                    navigation={navigation}
                    title="Past Listings"
                    listings={soldListings.slice(0, 4)}
                    onViewAll={() => navigation.navigate('FullListingsScreen', {
                        listings: activeListings,
                        mode: 'past',
                        title: 'Past Listings'
                    })}
                />}
            </ScrollView >) : (
                <TouchableOpacity
                    onPress={async () => {
                        try {
                            await unblockUser(user.uid, userID);
                            navigation.goBack()
                            refreshProfile();
                        } catch (error) {
                            console.error('Error unblocking user:', error);
                            showToast('Failed to unblock user');
                        }
                    }}
                    style={styles.unblockUserButton}
                >
                    <Text style={styles.unblockButtonText}>
                        Unblock user
                    </Text>
                </TouchableOpacity>
            )
            }
        </View >
    )

}

export default UserProfile;

const styles = StyleSheet.create({
    // FOLLOWING FOLLOWERS
    followingContainer: {
        alignItems: 'center',
        height: 40,
        justifyContent: 'space-between'
    },
    followingText: {
        fontFamily: 'inter',
        fontSize: 16,
        fontWeight: '500'
    },
    container: {
        flex: 1,
        // paddingBottom: 20
    },
    scrollContainer: {
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        alignSelf: 'center',
        paddingHorizontal: 1,
        // marginBottom: 20
    },
    topContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: 20
    },
    headerTextContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
    followText: {
        marginLeft: 4,
        fontSize: 15,
        fontFamily: 'inter',
        color: colors.accentGray
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
        fontWeight: '500',
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
    blockedContainer: {
        justifyContent: 'center',
        flex: 1
    },
    topBlockedText: {
        fontFamily: 'inter',
        fontSize: 20,
        fontWeight: '600'
    },
    bottomBlockedText: {
        fontFamily: 'inter',
        fontSize: 16,
        fontWeight: '400'
    },
    unblockUserButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 200,
        height: 45,
        borderRadius: 50,
        backgroundColor: colors.loginBlue,
        alignSelf: 'center',
        marginTop: 20
    },
    unblockButtonText: {
        fontSize: 18,
        fontWeight: '500',
        color: 'white',
        fontFamily: 'inter',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    followButtonText: {
        fontFamily: 'inter',
        fontSize: 16,
        fontWeight: '500'
    },
    followButton: {
        width: '48%',
        height: 35,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 15,
        backgroundColor: colors.lightgray,
    },
})
