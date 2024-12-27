import { View, Text } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import RecommendationCard from './RecommendationCard'
import { userContext } from '../../context/UserContext'
import { db } from '../../../firebaseConfig'
import { FlatList } from 'react-native'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { StyleSheet } from 'react-native'
import { RecentSearchSkeletonLoader } from '../../utils/search'


// gets the recommendations for the user
const computeRecommendations = async (userData) => {
    if (!userData?.following?.length) return [];

    // grab who the user is following
    const followingIds = userData.following.map(f => f.following_id)
    const followingQuery = query(
        collection(db, 'users'),
        where('__name__', 'in', followingIds)
    );
    const followingSnapshot = await getDocs(followingQuery);

    // recommendationsMap to count mutuals
    const recommendationMap = new Map();
    const myId = userData._id;

    //  go over each account that the user follows, and go over all of their followers 
    followingSnapshot.docs.forEach(doc => {
        const friend = doc.data();
        const friendFollowing = friend.following || [];

        friendFollowing.forEach(followedUser => {
            const candidateId = followedUser.following_id;

            //    skip if its active user or someone that they already follow 
            if (candidateId === myId || followingIds.includes(candidateId)) {
                return;
            }

            if (!recommendationMap.has(candidateId)) {
                recommendationMap.set(candidateId, {
                    mutualCount: 1,
                    user: {
                        id: followedUser.following_id || null,
                        pfp: followedUser.following_pfp || null,
                        name: followedUser.following_name || null
                    }
                });
            } else {
                const current = recommendationMap.get(candidateId);
                recommendationMap.set(candidateId, {
                    ...current,
                    mutualCount: current.mutualCount + 1
                });
            }
        });
    });

    // convert to array and sort by mutual count
    const recommendations = Array.from(recommendationMap.values())
        .sort((a, b) => b.mutualCount - a.mutualCount);

    return recommendations;
}

export default function Recommendations({ navigation }) {
    const { userData } = useContext(userContext)
    const [loading, setLoading] = useState(false)
    const [recommendations, setRecommendations] = useState([])

    useEffect(() => {
        const getRecs = async () => {
            try {
                setLoading(true)
                const recs = await computeRecommendations(userData)
                setRecommendations(recs)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        getRecs()
    }, [])

    const removeUserFromRecommendations = (userId) => {
        setRecommendations(prevRecs =>
            prevRecs.filter(rec => rec.user.id !== userId)
        );
    };

    return (
        <View style={styles.container}>
            {recommendations?.length > 0 && <Text style={styles.text}>
                Recommended
            </Text>}
            {recommendations?.length === 0 &&
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ fontFamily: 'inter', fontWeight: '600', fontSize: 18 }}>
                        No recommendations!
                    </Text>
                    <Text style={{ fontFamily: 'inter', fontWeight: '400', fontSize: 14 }}>
                        Follow users to get started
                    </Text>
                </View>
            }
            {!loading ? <FlatList
                keyboardDismissMode="on-drag"
                data={recommendations}
                renderItem={({ item, index }) => (
                    <RecommendationCard
                        navigation={navigation}
                        recommendedUser={item}
                        onRemove={() => removeUserFromRecommendations(item.user.id)}
                    />
                )}
            /> : <RecentSearchSkeletonLoader />}


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
    text: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '600',
        marginBottom: 12
    }
})