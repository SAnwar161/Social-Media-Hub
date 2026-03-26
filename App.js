import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';

import { navigationRef } from './src/services/NavigationService';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <TabNavigator />
        <StatusBar style="auto" translucent={true} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
