import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PersonalInformation from '../../screens/Profile/PersonalInformation'
import Profile from '../../screens/Profile/Profile'
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo'
import SoldItems from "../../screens/Profile/SoldItems";
import YourListings from "../../screens/Profile/YourListings";
import SavedItems from "../../screens/Profile/SavedItems";
import Analytics from "../../screens/Profile/Analytics";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import ListingScreen from "../../screens/Marketplace/ListingScreen";


const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator
            // initialRouteName="Profile"
            options={{ headerShown: false }}
            screenOptions={{
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false,
            }}

        >
            <ProfileStack.Screen
                name="Profile"
                component={Profile}
                options={{
                    headerTitle: () => (
                        <Logo />
                    )
                }}
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
                name="SoldItems"
                component={SoldItems}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={styles.title}>Sold listings</Text>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )
                })}
            />

            <ProfileStack.Screen
                name="Analytics"
                component={Analytics}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <Text style={styles.title}>Analytics</Text>
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