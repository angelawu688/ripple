import { createNativeStackNavigator, TransitionPresets } from "@react-navigation/native-stack";
import MessagesOverview from "../../screens/Messages/MessagesOverview";
import Conversation from "../../screens/Messages/Conversation";
import { Ionicons } from '@expo/vector-icons';
import ListingScreen from '../../screens/Marketplace/ListingScreen'

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import { Image, Text, TouchableOpacity } from "react-native";
import { DotsThree } from "phosphor-react-native";
import UserProfile from "../../screens/Marketplace/UserProfile";
import Reviews from "../../screens/Profile/Reviews";
import FullListingsScreen from "../../components/profile/FullListingsScreen";
import Followers from "../../screens/Profile/Followers";


const MessagesStack = createNativeStackNavigator();

const MessagesStackNavigator = () => {
    return (
        <MessagesStack.Navigator
            initialRouteName="MessagesOverview"
            screenOptions={{
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false,
                headerRight: () => (
                    <Image
                        source={require('../../../assets/images/Ripple_UW_Icon.png')}
                        style={{ height: 25, width: 25, marginBottom: -5 }}
                    />
                )
            }}
        >
            <MessagesStack.Screen
                name="MessagesOverview"
                component={MessagesOverview}
                options={{
                    animation: 'slide_from_left',
                    headerTitle: () => (
                        <Logo />
                    )
                }}
            />

            {/* ensure that userID is passed in as a prop */}
            <MessagesStack.Screen
                name="Conversation"
                component={Conversation}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <></>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.reset({
                            index: 0,
                            routes: [{ name: 'MessagesOverview' }],
                        })}>
                            <Ionicons name="chevron-back" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <></>
                    ),
                })}
            />

            <MessagesStack.Screen
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

            <MessagesStack.Screen
                name="UserProfile"
                component={UserProfile}
                options={({ navigation }) => ({
                    headerTitle: () => (
                        <></>
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

            <MessagesStack.Screen
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

            <MessagesStack.Screen
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

            <MessagesStack.Screen
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

        </MessagesStack.Navigator>
    )
}

export default MessagesStackNavigator