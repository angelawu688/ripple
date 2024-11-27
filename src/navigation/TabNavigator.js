import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProfileStackNavigator from './StackNavigators/ProfileStackNavigator';
import MarketplaceStackNavigator from './StackNavigators/MarketplaceStackNavigator';
import MessagesStackNavigator from './StackNavigators/MessagesStackNavigator';

import Logo from '../components/Logo'
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../colors'

import { ChatTeardropText, User, Storefront } from 'phosphor-react-native';



const Tab = createBottomTabNavigator();

// note:
// dont show headers on the stackNavigators, do that at a screen level
const TabNavigator = () => {
    return (
        <Tab.Navigator initialRouteName="MarketplaceStack"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;
                    // TODO
                    // modify this code to have custom icons, right now these are ionicons

                    if (route.name === 'MessagesStack') {
                        icon = focused
                            ? <ChatTeardropText size={28} color={'white'} weight="fill" />
                            : <ChatTeardropText size={28} color={'white'} />;
                    } else if (route.name === 'MarketplaceStack') {
                        icon = focused
                            ? <Storefront size={28} color={'white'} weight="fill" />
                            : <Storefront size={28} color={'white'} />;
                    } else if (route.name === 'ProfileStack') {
                        icon = focused
                            ? <User size={28} color={'white'} weight="fill" />
                            : <User size={28} color={'white'} />;
                    }
                    return icon;
                },
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false, // applied here
                // styling for all of the tabs, generally: 
                tabBarActiveTintColor: colors.black,
                tabBarInactiveTintColor: colors.black,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: colors.darkblue,
                    paddingTop: 12,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10
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