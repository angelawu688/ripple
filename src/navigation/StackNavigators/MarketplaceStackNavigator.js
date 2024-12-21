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

const MarketplaceStack = createNativeStackNavigator();

const MarketplaceStackNavigator = () => {
    return (
        <MarketplaceStack.Navigator
            initialRouteName="Marketplace"
            screenOptions={{
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false, // applied here
                headerRight: () => (
                    <Image
                        source={require('../../../assets/images/Ripple_UW_Icon.png')}
                        style={{ height: 25, width: 25, marginBottom: -5 }}

                    />
                )
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

            <MarketplaceStack.Screen
                name="Search"
                component={Search}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                    headerTitle: () => (
                        <Logo />
                    ),

                })}
            />

            {/* ensure that userID is passed in as a prop */}
            <MarketplaceStack.Screen
                name="ListingScreen"
                component={ListingScreen}
                options={({ navigation, route }) => ({
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
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
                    ),
                    headerRight: () => (
                        <></>
                    )
                })}
            />
            <MarketplaceStack.Screen
                name="EditPost"
                component={EditPost}
                options={({ navigation }) => ({
                    headerTitle: () => '',
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