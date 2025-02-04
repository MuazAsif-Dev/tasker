import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import RootNavigation from '@/screens/root';
import Providers from '@/providers';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <Providers>
      <NavigationContainer>
        <RootNavigation />
        <Toast />
      </NavigationContainer>
    </Providers>
  );
}
