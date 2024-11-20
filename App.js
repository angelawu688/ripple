import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation/MainNavigator';
import { UserProvider } from './src/context/UserContext';
import 'react-native-url-polyfill/auto';
import { AppRegistry } from 'react-native';
import './firebaseConfig';
import { useState } from 'react';
import { useFonts, Roboto_400Regular } from '@expo-google-fonts/roboto';
import { Syne_700Bold, Syne_400Regular } from '@expo-google-fonts/syne';
import { Inter_400Regular } from '@expo-google-fonts/inter'

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Syne_400Regular,
    Syne_700Bold,
    Inter_400Regular
  });

  if (!fontsLoaded) {
    // TODO replace this with the splash
    return <View>
      <ActivityIndicator size={'large'} />
    </View>
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