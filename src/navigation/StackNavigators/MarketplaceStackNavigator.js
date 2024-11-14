import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Marketplace from '../../screens/Marketplace/Marketplace'
import Search from '../../screens/Marketplace/Search'
import ListingScreen from '../../screens/Marketplace/ListingScreen'
import SellScreen from '../../screens/Marketplace/SellScreen'

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from "react-native";



const MarketplaceStack = createNativeStackNavigator();

const MarketplaceStackNavigator = ({ navigation }) => {
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
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Search')}
                        >
                            <Ionicons name="search" size={30} color="#000" />
                        </TouchableOpacity>
                    )
                }}
            />
            <MarketplaceStack.Screen
                name="Search"
                component={Search}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />

            {/* ensure that userID is passed in as a prop */}
            <MarketplaceStack.Screen
                name="ListingScreen"
                component={ListingScreen}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />

            <MarketplaceStack.Screen
                name="SellScreen"
                component={SellScreen}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />
        </MarketplaceStack.Navigator>
    )
}

export default MarketplaceStackNavigator