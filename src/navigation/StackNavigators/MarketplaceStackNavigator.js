import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Marketplace from '../../screens/Marketplace/Marketplace'
import ListingScreen from '../../screens/Marketplace/ListingScreen'
import SellScreen from '../../screens/Marketplace/SellScreen'

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from "react-native";
import CreateListing from "../../screens/Marketplace/MarketplaceLists/CreateListing";
import UserProfile from "../../screens/Marketplace/UserProfile";

const MarketplaceStack = createNativeStackNavigator();

const MarketplaceStackNavigator = () => {
    return (
        <MarketplaceStack.Navigator
            initialRouteName="Marketplace"
            options={{ headerShown: false }}
            screenOptions={{
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false, // applied here
            }}
        >
            <MarketplaceStack.Screen
                name="Marketplace"
                component={Marketplace}
                options={{
                    headerLeft: () => (null),
                    headerTitle: () => (
                        <Logo />
                    ),

                }}
            />

            {/* ensure that userID is passed in as a prop */}
            <MarketplaceStack.Screen
                name="ListingScreen"
                component={ListingScreen}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />

            <MarketplaceStack.Screen
                name="SellScreen"
                component={SellScreen}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />

            <MarketplaceStack.Screen
                name="CreateListing"
                component={CreateListing}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={{ fontFamily: 'inter', fontSize: 18, fontWeight: '500' }}> Listing </Text>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />
            <MarketplaceStack.Screen
                name="UserProfile"
                component={UserProfile}
                options={({ navigation }) => ({
                    headerTitle: () => '',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />
        </MarketplaceStack.Navigator>
    )
}

export default MarketplaceStackNavigator