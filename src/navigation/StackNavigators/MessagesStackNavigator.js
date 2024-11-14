import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagesOverview from "../../screens/Messages/MessagesOverview";
import Conversation from "../../screens/Messages/Conversation";

import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";



const MessagesStack = createNativeStackNavigator();

const MessagesStackNavigator = () => {
    return (
        <MessagesStack.Navigator
            initialRouteName="Profile"
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
                options={{
                    headerTitle: () => (
                        <Logo />
                    ),
                    headerLeft: () => <BackArrow />
                }}
            />
        </MessagesStack.Navigator>
    )
}

export default MessagesStackNavigator