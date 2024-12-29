import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import AuthStackNavigator from './StackNavigators/AuthStackNavigator'
import FullLoadingScreen from '../screens/shared/FullLoadingScreen'
import { useAuthNavigation } from '../hooks/useAuthNavigation';

const RootStack = createNativeStackNavigator()



const MainNavigator = () => {
  const { isLoading } = useAuthNavigation();

  if (isLoading) {
    return <FullLoadingScreen />;
  }

  return <NavContent />
}

export default MainNavigator;

const NavContent = () => {
  const { isAuthenticated } = useAuthNavigation();

  return (
    <RootStack.Navigator screenOptions={{
      contentStyle: { backgroundColor: 'white' }, // Set background for all screens
      headerShown: false,
    }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      ) : (
        <RootStack.Screen name="Main" component={TabNavigator} />
      )}
    </RootStack.Navigator>
  );
}