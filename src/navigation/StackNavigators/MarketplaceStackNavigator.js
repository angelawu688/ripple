import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Marketplace from '../../screens/Marketplace/Marketplace'
import ListingScreen from '../../screens/Marketplace/ListingScreen'

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, Image, View } from "react-native";
import CreateListing from "../../screens/Marketplace/MarketplaceLists/CreateListing";
import UserProfile from "../../screens/Marketplace/UserProfile";
import EditPost from "../../screens/Marketplace/MarketplaceLists/EditPost";
import { DotsThree } from "phosphor-react-native";
import Search from "../../screens/Marketplace/MarketplaceLists/Search";
import { MarketplaceTabNavigator } from "./MarketplaceTabNavigator";
import Reviews from "../../screens/Profile/Reviews";
import FullListingsScreen from "../../components/profile/FullListingsScreen";
import Followers from "../../screens/Profile/Followers";

const MarketplaceStack = createNativeStackNavigator();


const MarketplaceStackNavigator = () => {
    return (
        <MarketplaceStack.Navigator
            initialRouteName="MarketplaceTabs"
            screenOptions={DEFAULT_STACK_OPTIONS}
        >
            <MarketplaceStack.Screen
                name="MarketplaceTabs"
                component={MarketplaceTabNavigator}
                options={{
                    ...getDefaultLogo(),
                    contentStyle: { flex: 1 }
                }}
            />

            <MarketplaceStack.Screen
                name="Search"
                component={Search}
                options={({ navigation }) => ({
                    ...getDefaultBackArrow(navigation),
                    ...getDefaultLogo()
                })}
            />

            {/* ensure that userID is passed in as a prop */}
            <MarketplaceStack.Screen
                name="ListingScreen"
                component={ListingScreen}
                options={({ navigation, route }) => ({
                    ...getDefaultBackArrow(navigation),
                    ...getDefaultLogo(),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => route.params?.toggleModal && route.params.toggleModal()}
                        >
                            <DotsThree size={32} />
                        </TouchableOpacity>
                    )
                })}
            />

            <MarketplaceStack.Screen
                name="CreateListing"
                component={CreateListing}
                options={({ navigation }) => ({
                    ...getDefaultBackArrow(navigation),
                    ...getDefaultLogo(),
                })}
            />
            <MarketplaceStack.Screen
                name="UserProfile"
                component={UserProfile}
                options={({ navigation }) => ({
                    ...getDefaultBackArrow(navigation),
                    headerTitle: () => '',
                    headerRight: () => (
                        <></>
                    )
                })}
            />
            <MarketplaceStack.Screen
                name="EditPost"
                component={EditPost}
                options={({ navigation }) => ({
                    ...getDefaultBackArrow(navigation),
                    ...getDefaultLogo(),
                    headerTitle: () => '',
                })}
            />
            <MarketplaceStack.Screen
                name="Reviews"
                component={Reviews}
                options={({ navigation }) => ({
                    ...getDefaultBackArrow(navigation),
                    headerTitle: () => (
                        <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600' }}>
                            Reviews
                        </Text>
                    ),
                    headerRight: () => (
                        <></>
                    ),
                })}
            />

            <MarketplaceStack.Screen
                name="FullListingsScreen"
                component={FullListingsScreen}
                options={({ navigation, route }) => ({
                    headerTitle: () => (
                        <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600' }}>
                            {route?.title}
                        </Text>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <></>
                    ),
                })}
            />

            <MarketplaceStack.Screen
                name="Followers"
                component={Followers}
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
        </MarketplaceStack.Navigator >
    )
}

export default MarketplaceStackNavigator

const DEFAULT_STACK_OPTIONS = {
    contentStyle: { backgroundColor: 'white' },
    headerShadowVisible: false,
    headerRight: () => (
        // UW LOGO
        <Image
            source={require('../../../assets/images/Ripple_UW_Icon.png')}
            style={{ height: 25, width: 25, marginBottom: -5 }}
        />
    )
};

function getDefaultBackArrow(navigation) {
    return ({
        headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity >
        )
    })
}

function getDefaultLogo() {
    return ({
        headerTitle: () => <Logo />
    })
}