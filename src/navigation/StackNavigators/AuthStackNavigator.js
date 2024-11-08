import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Login from "../../screens/Auth/Login";
import SignUp from "../../screens/Auth/SignUp";
import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";

const AuthStack = createNativeStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{
          headerTitle: () => <Logo />,
        }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{
          headerTitle: () => <Logo />,
          headerLeft: () => <BackArrow />,
        }}
      />
    </AuthStack.Navigator>
  );
}

export default AuthStackNavigator;