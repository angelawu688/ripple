import { View, Text, FlatList } from 'react-native'
import React from 'react'
import LoadingSpinner from '../LoadingSpinner'
import { EmptyMessage, generateUserKeywords, RecentSearchSkeletonLoader } from '../../utils/search'
import RecommendationCard from './RecommendationCard'
import { TouchableOpacity } from 'react-native'
import UserResultCard from './UserResultCard'

const testRecs = [
    1, 2, 3, 4, 5, 6
]

export default function UserSearch({ navigation, query, loadingUserSearch, userSearchResults, displayUserSearchResults, userRecommendations }) {
    if (loadingUserSearch) {
        return <RecentSearchSkeletonLoader />
    }
    return (
        <View>
            {displayUserSearchResults ? (
                loadingUserSearch ? (
                    <View>
                        <Text>
                            Loading user search
                        </Text>
                    </View>
                ) : (
                    userSearchResults?.length > 0 ? (
                        <FlatList
                            data={userSearchResults}
                            renderItem={({ item, index }) => (
                                <UserResultCard
                                    navigation={navigation}
                                    user={item}
                                />


                            )}
                        />
                    ) : (
                        <EmptyMessage message={`No results for ${query}`} />
                    )
                )
            ) : (
                <View>
                    {query ? (
                        <Text>
                            Autocomplete for {query}
                        </Text>
                    ) : userRecommendations?.length > 0 ? (
                        <>
                            <Text>
                                Recommended users
                            </Text>
                            <FlatList
                                data={testRecs}
                                renderItem={(item, index) => (
                                    <RecommendationCard
                                        navigation={navigation}

                                    />
                                )}
                            />
                        </>
                    ) : (
                        <EmptyMessage message={'No recommendations'} />
                    )}
                </View>
            )}








            {/* {loadingUserSearch ? (

            ): (

                )}

            {displayUserSearchResults ? (
                userSearchResults?.length > 0 ? (
                    <Text>
                        Results go here
                    </Text>
                ) : (
                    <Text>
                        No results found!
                    </Text>
                )
            ) : (
                <View>
                    <Text>
                        Recommendations
                    </Text>
                    <FlatList
                        data={testRecs}
                        renderItem={(item, index) => (
                            <RecommendationCard />
                        )}
                    />
                </View>

            )} */}

        </View>
    )
}