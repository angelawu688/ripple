import { View, Text, FlatList } from 'react-native'
import React from 'react'
import LoadingSpinner from '../LoadingSpinner'
import { EmptyMessage, generateUserKeywords, RecentSearchSkeletonLoader } from '../../utils/search'
import RecommendationCard from './RecommendationCard'
import { TouchableOpacity } from 'react-native'
import UserResultCard from './UserResultCard'
import { TouchableWithoutFeedback } from 'react-native'
import { Keyboard } from 'react-native'

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
                            keyboardDismissMode="on-drag"
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
                <TouchableWithoutFeedback
                    style={{ backgroundColor: 'green', width: '100%', height: '100%' }}
                    onPress={() => Keyboard.dismiss()
                    }
                >
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
                                keyboardDismissMode="on-drag"
                                data={testRecs}
                                renderItem={(item, index) => (
                                    <RecommendationCard
                                        navigation={navigation}

                                    />
                                )}
                            />
                        </>
                    ) : (
                        <View style={{ width: '100%', height: '70%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'inter', fontSize: 18, fontWeight: '600' }}>
                                No recommendations
                            </Text>
                            <Text style={{ fontFamily: 'inter', fontSize: 14, fontWeight: '400' }}>
                                Follow users to get recommendations
                            </Text>
                        </View>

                        // <EmptyMessage message={'No recommendations'} />

                    )}
                </TouchableWithoutFeedback>
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