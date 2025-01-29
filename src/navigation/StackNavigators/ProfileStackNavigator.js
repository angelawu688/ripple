import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PersonalInformation from '../../screens/Profile/PersonalInformation'
import Profile from '../../screens/Profile/Profile'
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo'
import SoldItems from "../../screens/Profile/SoldItems";
import YourListings from "../../screens/Profile/YourListings";
import SavedItems from "../../screens/Profile/SavedItems";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import ListingScreen from "../../screens/Marketplace/ListingScreen";
import EditPost from "../../screens/Marketplace/MarketplaceLists/EditPost";
import UserProfile from '../../screens/Marketplace/UserProfile'
import Conversation from "../../screens/Messages/Conversation";
import OwnUserProfile from "../../screens/Profile/OwnUserProfile";
import { DotsThree, Gear } from "phosphor-react-native";
import Followers from "../../screens/Profile/Followers";
import Reviews from "../../screens/Profile/Reviews";
import FullListingsScreen from "../../components/profile/FullListingsScreen";


const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    return (

        <ProfileStack.Navigator
            initialRouteName="OwnUserProfile"
            // options={{ headerShown: true }}
            screenOptions={{
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false,

            }}
        >

            <ProfileStack.Screen
                name="OwnUserProfile"
                component={OwnUserProfile}
                options={({ navigation }) => ({
                    headerShown: false
                })}
            />

            <ProfileStack.Screen
                name="Profile"
                component={Profile}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                    headerTitle: () => (
                        <Logo />
                    )
                })}
            />

            <ProfileStack.Screen
                name="PersonalInformation"
                component={PersonalInformation}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={{ fontFamily: 'inter', fontWeght: '600', fontSize: 18 }}>Account Center</Text>
                        // <Logo />
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />

            <ProfileStack.Screen
                name="SavedItems"
                component={SavedItems}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={styles.title}>Saved Listings</Text>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />
            <ProfileStack.Screen
                name="YourListings"
                component={YourListings}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={styles.title}>Your listings</Text>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />

            <ProfileStack.Screen
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

            <ProfileStack.Screen
                name="EditPost"
                component={EditPost}
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

            <ProfileStack.Screen
                name="UserProfile"
                component={UserProfile}
                options={({ navigation }) => ({
                    // headerShown: false
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

            <ProfileStack.Screen
                name="Conversation"
                component={Conversation}
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

            <ProfileStack.Screen
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

            <ProfileStack.Screen
                name="Reviews"
                component={Reviews}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={{ fontSize: 18, fontFamily: 'inter', fontWeight: '600' }}>
                            Reviews
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

            <ProfileStack.Screen
                name="FullListingsScreen"
                component={FullListingsScreen}
                options={({ navigation, route }) => ({
                    headerTitle: () => (<></>),
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


        </ProfileStack.Navigator>
    )
}

export default ProfileStackNavigator

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontFamily: 'inter',
        fontWeight: '500'
    }
})