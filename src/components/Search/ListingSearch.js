import { View, Text } from 'react-native'
import React from 'react'
import { EmptyMessage, RecentSearchItem, RecentSearchSkeletonLoader } from '../../utils/search'
import ListingsListSkeletonLoaderFull from '../ListingsListSkeletonLoaderFull'
import { FlatList } from 'react-native'
import { StyleSheet } from 'react-native'
import { colors } from '../../colors'
import ListingsList from '../ListingsList'

export default function ListingSearch({ isLoading, query, navigation, displayResults, searchResults, handleSearchSelect, handleRemoveItemFromRecentSearches, loadingRecentSearches, recentSearches }) {
    return (
        <View>
            {displayResults ? (
                isLoading ? (
                    <ListingsListSkeletonLoaderFull />
                ) : (
                    searchResults?.length > 0 ? (
                        <ListingsList
                            listings={searchResults}
                            navigation={navigation}

                        />
                    ) : (
                        <EmptyMessage message={`No results for ${query}`} />
                    )
                )
            ) : (
                <View style={{ alignSelf: 'center', width: '95%' }}>
                    {query ? (
                        // Autocomplete
                        <Text>Autocomplete for {query}</Text>
                    ) : (
                        // Recent Searches
                        <>
                            <Text style={styles.sectionHeader}>Recent searches</Text>
                            {loadingRecentSearches ? (
                                <RecentSearchSkeletonLoader />
                            ) : (
                                recentSearches.length > 0 ? (
                                    <FlatList
                                        data={[...recentSearches].reverse().slice(0, 8)}
                                        keyExtractor={(item) => item}
                                        renderItem={({ item }) => (
                                            <RecentSearchItem
                                                item={item}
                                                onSelect={handleSearchSelect}
                                                onRemove={handleRemoveItemFromRecentSearches}
                                            />
                                        )}
                                        style={{ paddingBottom: 50 }} // this prevents clipping on bottom scroll
                                    />
                                ) : (
                                    <Text style={{ alignSelf: 'flex-start', fontFamily: 'inter', marginTop: 8 }}>
                                        Your recent searches will pop up here!
                                    </Text>
                                )
                            )}
                        </>
                    )}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '98%',
        alignSelf: 'center'
    },
    input: {
        height: 40,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 16,
        width: '95%',
        alignSelf: 'center',
        paddingRight: 40, // space for the icon
    },
    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 8,
    },
    resultsHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        marginLeft: '5%'
    },
    resultItem: {
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 8,
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 16,
    },
    clearButton: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 1,
    },
    iconContainer: {
        position: 'absolute',
        zIndex: 1,
        right: 10,
        top: 1,
        padding: 10,

    },
})