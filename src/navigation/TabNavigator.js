import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileStackNavigator from './StackNavigators/ProfileStackNavigator';
import MarketplaceStackNavigator from './StackNavigators/MarketplaceStackNavigator';
import MessagesStackNavigator from './StackNavigators/MessagesStackNavigator';
import { colors } from '../constants/colors'
import { userContext } from '../context/UserContext';
import { UnreadContext } from '../context/UnreadContext';
import { useTabBarVisibility } from '../hooks/useTabBarVisibility';
import { MarketplaceTabIcon, MessageTabIcon, ProfileTabIcon } from '../components/TabIcons';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

// note:
// dont show headers on the stackNavigators, do that at a screen level
const defaultScreenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' },
    headerShadowVisible: false,
    tabBarActiveTintColor: colors.black,
    tabBarInactiveTintColor: colors.black,
    tabBarShowLabel: false,
    tabBarStyle: {
        // backgroundColor: colors.white,
        paddingTop: 12,
        // borderTopWidth: 0.5,
        // opacity: 0.1,
        // backgroundColor: 'transparent',
        opacity: 0.7,
        // borderTopWidth: 0,
        // position: 'absolute',
        // left: 50,
        // right: 50,
        // bottom: 20,
        // height: 100
    },
}

const TabNavigator = () => {
    const { userData } = useContext(userContext)
    const { unreadCount } = useContext(UnreadContext);

    function renderTabIcon(route, { focused }) {
        switch (route.name) {
            case 'MessagesStack':
                return <MessageTabIcon focused={focused} unreadCount={unreadCount} />;
            case 'MarketplaceStack':
                return <MarketplaceTabIcon focused={focused} />;
            case 'ProfileStack':
                return <ProfileTabIcon focused={focused} userData={userData} />;
            default:
                return null;
        }
    }

    return (
        <Tab.Navigator
            initialRouteName={'MarketplaceStack'}
            screenOptions={({ route }) => ({
                ...defaultScreenOptions,
                tabBarIcon: (props) => renderTabIcon(route, props),
            })}
        >
            <Tab.Screen
                name={'MessagesStack'}
                component={MessagesStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: useTabBarVisibility(route),
                })}
            />

            <Tab.Screen
                name={'MarketplaceStack'}
                component={MarketplaceStackNavigator}
                options={({ route }) => ({
                    tabBarStyle: useTabBarVisibility(route),
                })}
            />

            <Tab.Screen
                name={'ProfileStack'}
                component={ProfileStackNavigator}
            />
        </Tab.Navigator>
    )
}

export default TabNavigator;