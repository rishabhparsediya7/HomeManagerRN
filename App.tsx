import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AuthorizeNavigation from './src/navigators/authorizeStack';
import UnauthorizeNavigation from './src/navigators/unauthorizeStack';
import AuthProvider, {useAuth} from './src/providers/AuthProvider';
import UserProvider from './src/providers/UserContext';

const RootNavigator = () => {
  const {isAuthenticated} = useAuth();
  return isAuthenticated ? <AuthorizeNavigation /> : <UnauthorizeNavigation />;
};

const App = () => {
  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      <AuthProvider>
        <UserProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </UserProvider>
      </AuthProvider>
    </SafeAreaView>
  );
};

export default App;
