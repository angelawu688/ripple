import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import FullLoadingScreen from '../../screens/shared/FullLoadingScreen'
import { useNavigation } from '@react-navigation/native';
import ListingsList from '../listings/ListingsList';

export default function FullListingsScreen({
    route
}) {
    const { mode, listings, loading, title } = route.params
    const navigation = useNavigation();


    useEffect(() => {
        // Set navigation title
        navigation.setOptions({
            headerTitle: title
        });
    }, [navigation, title, mode]);

    if (loading) {
        return <FullLoadingScreen />
    }

    if (!mode || (mode !== 'active' && mode !== 'past')) {
        if (mode) {
            console.error(`mode '${mode}' is not either "active" or "past"`)
        } else {
            console.error('no mode defined in fullListingScreen!')
        }
        return (
            <View style={styles.container}>
                <Text>
                    Invalid mode!
                </Text>
            </View>
        )
    }

    // empty case
    if (!listings) {
        return (
            <View style={styles.container}>
                <Text>
                    No {mode === 'active' ? 'Active' : 'Past'} Listings!
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ListingsList
                listings={listings}
                navigation={navigation}
                scrollEnabled={true}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%'
    }
})