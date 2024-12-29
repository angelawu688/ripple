import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { colors } from '../../constants/colors'
import LoadingSpinner from '../../components/LoadingSpinner'
import { DotsThree } from 'phosphor-react-native'
import { userContext } from '../../context/UserContext'
import { ToastContext } from '../../context/ToastContext'
import { StyleSheet } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native'
import { handleRemoveFollower } from '../../utils/socialUtils'
import ReportModal from '../../components/ReportModal'

export default function Followers({ navigation, route }) {
    const { isFollowers: initIsFollowers } = route.params
    const {
        user,
        userData,
        setUser,
        setUserData,
        setUserFollowers,
        setUserFollowing,
        setUserFollowingIds
    } = useContext(userContext);

    const { showToast } = useContext(ToastContext)
    const [users, setUsers] = useState([])
    const [isFollowers, setIsFollowers] = useState(initIsFollowers)
    const [loading, setLoading] = useState(true)

    const [activeModalId, setActiveModalId] = useState(null) // track which modal should be open
    const toggleModal = (userId) => {
        setActiveModalId((prevActiveModalId) =>
            prevActiveModalId === userId ? null : userId
        );
    };

    // for reporting
    const [reportModalVisible, setReportModalVisible] = useState(false)


    useEffect(() => {
        const data = isFollowers ? userData.followers : userData.following;
        setUsers(data || []);
        setLoading(false);
    }, [isFollowers]);

    const handleReportUser = (userId) => {
        try {
            setReportModalVisible(true)
        } catch (e) {
            console.error(e)
        } finally {
            setActiveModalId(null)
        }
    }

    // const handleBlockUser = () => {
    //     try {
    //         showToast('User blocked!')
    //     } catch (e) {
    //         console.error(e)
    //     } finally {
    //         setActiveModalId(null)

    //     }
    // }

    if (loading) {
        return <LoadingSpinner />
    }


    return (
        <View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 }}>
                <TouchableOpacity style={{ width: '50%', display: 'flex', alignItems: 'center' }}
                    onPress={() => setIsFollowers(!isFollowers)}

                >
                    <Text style={{ fontSize: 16, fontFamily: 'inter', color: isFollowers ? 'black' : colors.accentGray }}>
                        Followers
                    </Text>
                    <View style={{ marginTop: 10, width: '100%', height: 1, backgroundColor: !isFollowers ? colors.loginGray : 'black' }} />

                </TouchableOpacity>


                <TouchableOpacity style={{ width: '50%', display: 'flex', alignItems: 'center' }}
                    onPress={() => setIsFollowers(!isFollowers)}>
                    <Text style={{ fontSize: 16, fontFamily: 'inter', color: isFollowers ? colors.accentGray : 'black' }}>
                        Following
                    </Text>
                    <View style={{ marginTop: 10, width: '100%', height: 1, backgroundColor: isFollowers ? colors.loginGray : 'black' }} />

                </TouchableOpacity>
            </View>
            {users && users.length !== 0 ? <FlatList
                data={users}
                ListFooterComponent={<View style={{ width: '100%', height: 100 }} />}
                style={{ paddingHorizontal: 10 }}
                renderItem={({ item, index }) => {

                    const userID = isFollowers ? item.follower_id : item.following_id
                    const pfp = isFollowers ? item.follower_pfp : item.following_pfp
                    const name = isFollowers ? item.follower_name : item.following_name
                    const major = isFollowers ? item.follower_major : item.following_major
                    const isModalVisible = activeModalId === userID

                    return (
                        <View
                            key={`user-${userID}-${index}`}
                            style={{ height: 60, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
                        >
                            <TouchableOpacity
                                activeOpacity={isModalVisible ? 1 : 0.2}
                                onPress={() => {
                                    if (isModalVisible) {
                                        setActiveModalId(null)
                                    } else {
                                        navigation.navigate('UserProfile', { userID: userID })
                                    }
                                }}


                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}

                            >
                                <Image
                                    style={{
                                        width: 60, height: 60, display: 'flex', justifyContent: 'center', marginRight: 15,
                                        alignItems: 'center', backgroundColor: colors.loginGray, borderRadius: 50

                                    }}
                                    source={{ uri: pfp }}
                                />
                                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'inter', fontWeight: '600' }}>{name}</Text>
                                    <Text style={{ fontSize: 16, fontFamily: 'inter', fontWeight: '400', color: colors.loginBlue }}>
                                        {major || 'Student'}
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => toggleModal(userID)}
                            >
                                <DotsThree size={30} weight='bold' />
                            </TouchableOpacity>
                            {/* MODAL VIEW */}
                            {isModalVisible && (
                                <TouchableWithoutFeedback
                                    style={styles.modalBackdrop}
                                    onPress={() => setActiveModalId(null)}
                                >
                                    <View style={styles.modalContainer}>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveFollower(
                                                user,
                                                userID,
                                                isFollowers,
                                                setActiveModalId,
                                                setUsers,
                                                setUser,
                                                showToast,
                                                setUserData,
                                                setUserFollowers,
                                                setUserFollowing,
                                                setUserFollowingIds
                                            )}
                                            style={[styles.modalOption, { borderBottomWidth: 0 }]}>
                                            <Text style={[styles.modalText, { color: 'black' }]}>
                                                {isFollowers ? 'Remove follower' : 'Unfollow'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                handleReportUser(userID)
                                                toggleModal(userID)
                                            }}
                                            style={[styles.modalOption, { borderBottomWidth: 0 }]}>
                                            <Text style={[styles.modalText, { color: 'red' }]}>
                                                Report user
                                            </Text>
                                        </TouchableOpacity>

                                        {/* <TouchableOpacity
                                            onPress={() => handleBlockUser()}
                                            style={[styles.modalOption, { borderBottomWidth: 0 }]}>
                                            <Text style={[styles.modalText, { color: 'red' }]}>
                                                Block user
                                            </Text>
                                        </TouchableOpacity> */}

                                        {/* <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.modalText, { color: 'black' }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity> */}
                                    </View>
                                </TouchableWithoutFeedback>
                            )}


                        </View>
                    )
                }}
                keyExtractor={(item, index) => `${isFollowers ? item.follower_id : item.following_id}-${index}`}

            /> : <View style={{ width: '100%', alignItems: 'center', marginTop: 25 }}>
                <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '500' }}>
                    {isFollowers ? 'You have no followers' : "You aren't following any users"}
                </Text>
            </View>}


            {!users && (
                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'inter' }}>
                        {isFollowers && 'Your followers will show up here!'}
                        {!isFollowers && 'Users following you will show up here!'}
                    </Text>
                </View>
            )}

            <ReportModal
                visible={reportModalVisible}
                onClose={() => {
                    setReportModalVisible(false)
                    setActiveModalId(null);
                }
                }
                userId={activeModalId} // id of the active user
            />
        </View>
    )
}

const styles = StyleSheet.create({
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 99,
        flex: 1,
    },
    modalContainer: {
        position: 'absolute',
        top: 50, // Adjust to position the modal just below the header
        right: 0, // Align with the three dots
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 12,
        paddingVertical: 4,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        zIndex: 999,
    },

    modalOption: {
        // paddingVertical: 6,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: '500',
        fontFamily: 'inter'
    },
})