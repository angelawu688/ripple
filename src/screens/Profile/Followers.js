import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { colors } from '../../colors'
import LoadingSpinner from '../../components/LoadingSpinner'
import { DotsThree } from 'phosphor-react-native'
import { userContext } from '../../context/UserContext'

export default function Followers({ navigation, route }) {
    const { isFollowers: initIsFollowers } = route.params
    const { userData } = useContext(userContext)
    const [users, setUsers] = useState([])
    const [isFollowers, setIsFollowers] = useState(initIsFollowers)
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const data = isFollowers ? userData.followers : userData.following;
        setUsers(data);
        setLoading(false);
    }, [isFollowers]);

    if (loading) {
        return <LoadingSpinner />
    }

    return (
        <View>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setIsFollowers(!isFollowers)}>
                    <Text style={{ fontSize: 16, fontFamily: 'inter', color: isFollowers ? 'black' : colors.accentGray }}>
                        Followers
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsFollowers(!isFollowers)}>
                    <Text style={{ fontSize: 16, fontFamily: 'inter', color: isFollowers ? colors.accentGray : 'black' }}>
                        Following
                    </Text>
                </TouchableOpacity>
            </View>
            {users && <FlatList
                data={users}
                style={{ paddingHorizontal: 10 }}
                renderItem={({ item, index }) => {

                    const userID = isFollowers ? item.followers_id : item.following_id
                    const pfp = isFollowers ? item.followers_pfp : item.following_pfp
                    const name = isFollowers ? item.followers_name : item.following_name


                    return (
                        <View

                            style={{ height: 60, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
                        >
                            <TouchableOpacity
                                onPress={() => console.log(
                                    'left side pressed'
                                )}
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
                                        {'Major will go here'}
                                    </Text>
                                </View>

                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => console.log('right side pressed')}
                            >
                                <DotsThree size={30} weight='bold' />
                            </TouchableOpacity>


                        </View>
                    )
                }}
                keyExtractor={(item, index) => isFollowers ? item.followers_id : item.following_id}

            />}


            {!users && (
                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', fontFamily: 'inter' }}>
                        {isFollowers && 'Your followers will show up here!'}
                        {!isFollowers && 'Users following you will show up here!'}
                    </Text>
                </View>
            )}
        </View>
    )
}