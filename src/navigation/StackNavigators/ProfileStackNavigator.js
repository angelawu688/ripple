import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PersonalInformation from '../../screens/Profile/PersonalInformation'
import Profile from '../../screens/Profile/Profile'

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import SoldItems from "../../screens/Profile/SoldItems";
import YourListings from "../../screens/Profile/YourListings";
import SavedItems from "../../screens/Profile/SavedItems";
import Analytics from "../../screens/Profile/Analytics";
import { Text } from "react-native";


const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator
            initialRouteName="Profile"
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
                options={{
                    headerTitle: () => (
                        <Text style={{ fontFamily: 'inter', fontWeght: '600', fontSize: 18 }}>Account Center</Text>
                        // <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />


            <ProfileStack.Screen
                name="SavedItems"
                component={SavedItems}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />
            <ProfileStack.Screen
                name="YourListings"
                component={YourListings}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />
            <ProfileStack.Screen
                name="SoldItems"
                component={SoldItems}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />

            <ProfileStack.Screen
                name="Analytics"
                component={Analytics}
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />
        </ProfileStack.Navigator>
    )
}

export default ProfileStackNavigator