import { View, Text, StyleSheet, Pressable, FlatList, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import ListingCard from '../listings/ListingCard'
import { colors } from '../../constants/colors'

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ListingSection({
    title,
    listings,
    onViewAll,
    navigation
}) {
    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => navigation.navigate('ListingScreen', { listingID: item.id })}
            style={{ width: SCREEN_WIDTH / 2, padding: 1 }}
        >
            <ListingCard listing={item} />
        </Pressable>
    );

    return (
        <View style={[styles.container, { height: listings.length > 0 ? 260 : 60 }]}>
            {/* TOP BAR */}
            <View style={[styles.barTextContainer, { marginBottom: listings.length > 0 ? 10 : 0 }]}>
                <Text style={styles.savedItemsText}>
                    {title}
                </Text>
                {listings.length !== 0 && <TouchableOpacity
                    onPress={onViewAll}
                    style={styles.viewAllButton}
                >
                    <Text style={styles.viewAllText}>
                        View all
                    </Text>
                </TouchableOpacity>}
            </View>

            <View style={{ justifyContent: 'center', height: '100%', marginLeft: -10 }}>
                {listings.length > 0 ? <FlatList
                    contentContainerStyle={styles.listContainer}
                    data={listings}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                /> : (
                    <Text style={styles.emptyText}>
                        No {title}
                    </Text>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 18,
        height: 280,
        width: '100%',
    },
    barTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        paddingHorizontal: 12,
    },
    listContainer: {
        paddingHorizontal: 12,
        gap: 8,
    },
    savedItemsText: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'inter'
    },
    viewAllButton: {
        paddingHorizontal: 20,
        paddingVertical: 4,
        backgroundColor: colors.loginBlue,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        gap: 4
    },
    viewAllText: {
        fontSize: 14,
        fontFamily: 'inter',
        fontWeight: '500',
        color: 'white'
    },
    emptyText: {
        alignSelf: 'center',
        textAlign: 'center',
        fontFamily: 'inter',
        fontSize: 14,
        fontWeight: '400',
        justifyContent: 'center'
    }
})