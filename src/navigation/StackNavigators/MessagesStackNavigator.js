import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagesOverview from "../../screens/Messages/MessagesOverview";
import Conversation from "../../screens/Messages/Conversation";
import { Ionicons } from '@expo/vector-icons';

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import { TouchableOpacity } from "react-native";



const MessagesStack = createNativeStackNavigator();

const MessagesStackNavigator = () => {
    return (
        <MessagesStack.Navigator
            initialRouteName="MessagesOverview"
            options={{ headerShown: false }}
            screenOptions={{
                contentStyle: { backgroundColor: 'white' },
                headerShadowVisible: false,
            }}

        >
            <MessagesStack.Screen
                name="MessagesOverview"
                component={MessagesOverview}
                options={{
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