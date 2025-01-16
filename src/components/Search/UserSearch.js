import { View, Text, FlatList } from 'react-native'
import React from 'react'
import LoadingSpinner from '../LoadingSpinner'
import { EmptyMessage, generateUserKeywords, RecentSearchSkeletonLoader } from '../../utils/search'
import Recommendations from './Recommendations'
import { TouchableOpacity } from 'react-native'
import UserResultCard from './UserResultCard'
import { TouchableWithoutFeedback } from 'react-native'
import { Keyboard } from 'react-native'


export default function UserSearch({ navigation, query, loadingUserSearch, userSearchResults, displayUserSearchResults }) {
    if (loadingUserSearch) {
        return <RecentSearchSkeletonLoader />
    }
    return (
        <View style={{ flex: 1 }}>
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
                            renderItem={({ item, index }) => {
                                return (
                                    <UserResultCard
                                        navigation={navigation}
                                        user={item}
                                    />
                                )
                            }}
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
                        <>
                        </>
                        // <Text>
                        //     Autocomplete for {query}
                        // </Text>
                    ) : (<Recommendations
                        navigation={navigation}
                    />)}
                </TouchableWithoutFeedback>
            )}
        </View>
    )
}