import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ForYou from '../../screens/Marketplace/MarketplaceLists/ForYou';
import Sell from '../../screens/Marketplace/MarketplaceLists/Sell';
import Friends from '../../screens/Marketplace/MarketplaceLists/Friends';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { MagnifyingGlass, Plus } from 'phosphor-react-native';
import { colors } from '../../constants/colors';
// import { useNavigation } from '@react-navigation/native';
// import { useEffect, useLayoutEffect } from 'react';

const Tab = createMaterialTopTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.topBarContainer}>
            <View style={styles.topBarLeft}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel ?? route.name;
                    const isFocused = state.index === index;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            style={[
                                styles.titleContainer,
                                isFocused && styles.selectedTitle
                            ]}
                            // onPress={() => navigation.navigate(route.name)}
                            onPress={() => navigation.jumpTo(route.name)}
                        >
                            <Text
                                style={[
                                    styles.titleText,
                                    { color: isFocused ? 'black' : colors.accentGray }
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate('Search')}
            >
                <MagnifyingGlass />
            </TouchableOpacity>
        </View>
    );
}

export function MarketplaceTabNavigator({ navigation }) {
    return (
        <View style={styles.container}>
            <Tab.Navigator
                tabBar={props => {
                    return (
                        <CustomTabBar {...props} />
                    )
                }}
                options={{
                    style: { backgroundColor: 'white' }
                }}
            >
                <Tab.Screen
                    name="ForYou"
                    component={ForYou}
                    options={{ tabBarLabel: 'For You' }}
                />
                <Tab.Screen
                    name="Friends"
                    component={Friends}
                    options={{ tabBarLabel: 'Friends' }}
                />
                <Tab.Screen
                    name="Sell"
                    component={Sell}
                    options={{ tabBarLabel: 'Sell' }}
                />
            </Tab.Navigator>

            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateListing')}
            >
                <Plus color={colors.loginBlue} weight='bold' size={26} />
            </TouchableOpacity>
        </View >

    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1,
    },
    topBarContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 40,
        paddingLeft: 20,
        paddingRight: 16,
        marginTop: 4,
        // marginBottom: 16,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: colors.loginGray
    },
    topBarLeft: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '75%',
        height: '100%',
        alignItems: 'center'
    },
    titleContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        position: 'relative',
    },
    selectedTitle: {
        borderBottomWidth: 1,
        borderBottomColor: 'black'
    },
    titleText: {
        fontSize: 16,
        fontFamily: 'inter',
        fontWeight: '500',
        textAlign: 'center'
    },
    createButton: {
        backgroundColor: colors.lightgray,
        borderColor: colors.darkblue,
        width: 60,
        height: 60,
        borderRadius: 50,
        position: 'absolute',
        bottom: 15,
        right: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.neonBlue,
        shadowOpacity: 0.35,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 0 },
    },
})