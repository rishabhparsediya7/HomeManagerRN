import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {NavigationContainer} from '@react-navigation/native';
import React, { useEffect } from 'react';
import {StyleSheet, View, Text, Button} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import AuthorizeNavigation from './src/navigators/authorizeStack';
import UnauthorizeNavigation from './src/navigators/unauthorizeStack';
import AuthProvider, {useAuth} from './src/providers/AuthProvider';
import UserProvider from './src/providers/UserContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
const RootNavigator = () => {
  const {isAuthenticated} = useAuth();
  return isAuthenticated ? <AuthorizeNavigation /> : <UnauthorizeNavigation />;
};

const App = () => {
  const fallbackUI = (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>
        The app encountered an unexpected error. Please restart the application.
      </Text>
    </View>
  );

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  return (
    <ErrorBoundary fallback={fallbackUI}>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheetModalProvider>
          <SafeAreaView style={StyleSheet.absoluteFill}>
            <AuthProvider>
              <UserProvider>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </UserProvider>
            </AuthProvider>
          </SafeAreaView>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
