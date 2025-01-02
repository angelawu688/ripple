import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import './firebaseConfig';
import FullLoadingScreen from './src/screens/shared/FullLoadingScreen';
import Toast from './src/components/toasts/CustomToast';
import { linkingConfig } from './src/constants/links';
import { AppProviders } from './src/providers/AppProviders';
import { useFontLoader } from './src/hooks/useFontLoader';
import { usePushNotifications } from './src/hooks/usePushNotifications';

export default function App() {
  const { appIsReady } = useFontLoader();

  // dont load the app until the fonts are loaded
  if (!appIsReady) {
    return null; // this keeps the splash up
  }

  return (
    <AppProviders>
      <RootComponent />
    </AppProviders>
  );
}

// separate the middle into root so that we are able to grab the loading prop
// from the user context, fixing the flickering issue
const RootComponent = () => {
  const { isLoading } = usePushNotifications();

  if (isLoading) {
    return <FullLoadingScreen />
  }

  return (
    <NavigationContainer linking={linkingConfig}>
      <Toast />
      <MainNavigator />
      <StatusBar style='dark' />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent('main', () => App);