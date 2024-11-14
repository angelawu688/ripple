import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Login from "../../screens/Auth/Login";
import SignUp from "../../screens/Auth/SignUp";
import Logo from '../../components/Logo'
import BackArrow from "../../components/BackArrow";
import EmailOnboarding from "../../screens/Auth/EmailOnboarding";
import InfoOnboarding from "../../screens/Auth/EducationOnboarding";
import EducationOnboarding from "../../screens/Auth/InfoOnboarding";
import { TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import EmailConfirmation from "../../screens/Auth/EmailConfirmation";



const AuthStack = createNativeStackNavigator();

const AuthStackNavigator = ({ navigation }) => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
        headerShadowVisible: false, // applied here
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{
          headerTitle: () => <Logo />,
        }}
      />
      <AuthStack.Screen
        name="EmailOnboarding"
        component={EmailOnboarding}
        options={{
          headerTitle: () => <Logo />,
          headerLeft: () => (<TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>)
        }}
      />
      <AuthStack.Screen
        name="EmailConfirmation"
        component={EmailConfirmation}
        options={{
          headerTitle: () => <Logo />,
          headerLeft: () => (<TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>)
        }}
      />
      <AuthStack.Screen
        name="InfoOnboarding"
        component={InfoOnboarding}
        options={{
          headerTitle: () => <Logo />,
          headerLeft: () => (<TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>)
        }}
      />
      <AuthStack.Screen
        name="EducationOnboarding"
        component={EducationOnboarding}
        options={{
          headerTitle: () => <Logo />,
          headerLeft: () => (<TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>)
        }}
      />
    </AuthStack.Navigator >
  );
}

export default AuthStackNavigator;