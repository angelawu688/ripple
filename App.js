import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { UserProvider } from './src/context/UserContext';
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import './firebaseConfig';
import { useEffect, useState } from 'react';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import { Syne_700Bold, Syne_400Regular } from '@expo-google-fonts/syne';
import { Inter_400Regular } from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen';

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
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // dont load the app until the fonts are loaded
  if (!fontsLoaded) {
    return;
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <MainNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserProvider>
  );
}
AppRegistry.registerComponent('main', () => App);