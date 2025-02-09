import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import AuthStackNavigator from './StackNavigators/AuthStackNavigator'
import FullLoadingScreen from '../screens/shared/FullLoadingScreen'
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useContext } from 'react';
import { userContext } from '../context/UserContext';
import { BlankLandingPage } from '../screens/Auth/LandingPage';

const RootStack = createNativeStackNavigator()



const MainNavigator = () => {
  const { isLoading } = useAuthNavigation();
  const { user } = useContext(userContext)

  // if these are left blank, the splash will stay up
  if (isLoading && user) {
    // return <FullLoadingScreen />;
  } else if (isLoading && !user) {
    // return <BlankLandingPage />
  }

  return <NavContent />
}

export default MainNavigator;

const NavContent = () => {
  const { isAuthenticated } = useAuthNavigation();

  return (
    <RootStack.Navigator screenOptions={{
      contentStyle: { backgroundColor: 'white' }, // set background for all screens
      headerShown: false,
    }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={TabNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
}