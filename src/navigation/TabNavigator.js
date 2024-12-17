import React, { useContext } from 'react';
import { Image, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProfileStackNavigator from './StackNavigators/ProfileStackNavigator';
import MarketplaceStackNavigator from './StackNavigators/MarketplaceStackNavigator';
import MessagesStackNavigator from './StackNavigators/MessagesStackNavigator';

import Logo from '../components/Logo'
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../colors'
import { ChatTeardropText, User, Storefront } from 'phosphor-react-native';
import { userContext } from '../context/UserContext';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';



const Tab = createBottomTabNavigator();

// note:
// dont show headers on the stackNavigators, do that at a screen level
const TabNavigator = () => {
    const { userData } = useContext(userContext)

    return (
        <Tab.Navigator initialRouteName="MarketplaceStack"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let icon;
                    // TODO
                    // modify this code to have custom icons, right now these are ionicons

                    if (route.name === 'MessagesStack') {
                        icon = focused
                            ? <ChatTeardropText size={28} color={colors.loginBlue} weight="fill" />
                            : <ChatTeardropText size={28} color={colors.loginBlue} />;
                    } else if (route.name === 'MarketplaceStack') {
                        icon = focused
                            ? <Storefront size={28} color={colors.loginBlue} weight="fill" />
                            : <Storefront size={28} color={colors.loginBlue} />;
                    } else if (route.name === 'ProfileStack') {
                        icon = userData?.pfp ? (
                            <Image
                                source={{ uri: userData?.pfp }}
                                style={{
                                    width: 28,
                                    height: 28,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex',
                                    borderRadius: 50,
                                    opacity: focused ? 1.0 : 0.7
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    width: 28,
                                    height: 28,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    display: 'flex',
                                    borderRadius: 50,
                                    backgroundColor: colors.loginGray,
                                    opacity: focused ? 1.0 : 0.7
                                }}
                            >
                                <User />
                            </View>
                        )
                        // icon = focused
                        //     ? <User size={28} color={colors.loginBlue} weight="fill" />
                        //     : <User size={28} color={colors.loginBlue} />;
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
                    backgroundColor: colors.white,
                    paddingTop: 12,
                    // borderTopLeftRadius: 10,
                    // borderTopRightRadius: 10,
                    borderTopWidth: 0.5,
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
                options={({ route }) => ({
                    headerShown: false,
                    // remove the tab bar if we are in a conversation
                    tabBarStyle: ((route) => {
                        const routeName = getFocusedRouteNameFromRoute(route) ?? ''
                        if (routeName === 'Conversation') {
                            return {
                                display: 'none'
                            }
                        }
                        return {
                            backgroundColor: colors.white,
                            paddingTop: 12,
                            borderTopWidth: 0.5,
                        }
                    })(route),
                })}
            />
        </Tab.Navigator>
    )
}

export default TabNavigator;