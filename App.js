import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { userContext, UserProvider } from './src/context/UserContext';
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import './firebaseConfig';
import { useContext, useEffect, useState } from 'react';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import { Syne_700Bold, Syne_400Regular } from '@expo-google-fonts/syne';
import { Inter_400Regular } from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking'
import FullLoadingScreen from './src/screens/shared/FullLoadingScreen';
import { registerForPushNotificationsAsync } from './src/utils/notifications';
import { handleUrlParams } from 'expo-router/build/fork/getStateFromPath-forks';

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Syne_400Regular,
    Syne_700Bold,
    Inter_400Regular
  });

  // keep the splash up until the fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(console.warn);;
    }
  }, [fontsLoaded]);

  // dont load the app until the fonts are loaded
  if (!fontsLoaded) {
    return;
  }

  return (
    <UserProvider>
      <RootComponent />
    </UserProvider>
  );
}

// separate the middle into root so that we are able to grab the loading prop
// from the user context, fixing the flickering issue
const RootComponent = () => {
  const { isLoading, user } = useContext(userContext);

  // register the user for async notifications
  useEffect(() => {
    const handleRegisterForPushNotificationsAsync = async () => {
      if (!isLoading && user) {
        const token = await registerForPushNotificationsAsync(user.uid);
        console.log(token)
      }
    }
    handleRegisterForPushNotificationsAsync()
  }, [isLoading, user])

  if (isLoading) {
    return <FullLoadingScreen text={'Loading auth from main'} />
  }




  // ALLOWS FOR DEEP LINKS
  // this needs a lot more testing lmao
  const linking = {
    // basically grabbing how the link will be created
    // i.e. if you are on dev you wont be able to try prod ones, vice versa
    // dont anticipate this being an issue
    // in prod, we will need to use firebase dynamic links to redirect users without the app to the app store
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Main: {
          screens: {
            MarketplaceStack: {
              screens: {
                ListingScreen: 'listing/:listingID', // bring them to the info that was passed in
                UserProfile: 'user/:userID', // same thing as above, now just with the user
              },
            },
          },
        },
        Auth: '*', // if no user profile, direct them to auth stack
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <MainNavigator />
      <StatusBar style='dark' />
    </NavigationContainer>
  )
}

AppRegistry.registerComponent('main', () => App);