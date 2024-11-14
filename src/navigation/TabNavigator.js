import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProfileStackNavigator from './StackNavigators/ProfileStackNavigator';
import MarketplaceStackNavigator from './StackNavigators/MarketplaceStackNavigator';
import MessagesStackNavigator from './StackNavigators/MessagesStackNavigator';

import Logo from '../components/Logo'
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../colors'



const Tab = createBottomTabNavigator();

// note:
// dont show headers on the stackNavigators, do that at a screen level
const TabNavigator = () => {
    return (
        <Tab.Navigator initialRouteName="MarketplaceStack"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    // TODO
                    // modify this code to have custom icons, right now these are ionicons

                    if (route.name === 'MessagesStack') {
                        iconName = focused
                            ? 'chatbubble'
                            : 'chatbubble-outline';
                    } else if (route.name === 'MarketplaceStack') {
                        iconName = focused
                            ? 'cash'
                            : 'cash-outline';
                    } else if (route.name === 'ProfileStack') {
                        iconName = focused
                            ? 'person'
                            : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />

                },

                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false, // applied here



                // styling for all of the tabs, generally: 
                tabBarActiveTintColor: colors.black,
                tabBarInactiveTintColor: colors.black,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: colors.lightgray
                },

            })}
        >
            <Tab.Screen name="ProfileStack"
                component={ProfileStackNavigator}
                options={{
                    headerShown: false
                }}
            />
            <Tab.Screen name="MarketplaceStack"
                component={MarketplaceStackNavigator}
                options={{
                    headerShown: false
                }}
            />

            <Tab.Screen name="MessagesStack"
                component={MessagesStackNavigator}
                options={{
                    headerShown: false
                }}
            />
        </Tab.Navigator>
    )
}

export default TabNavigator;