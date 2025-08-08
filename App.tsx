import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer } from '@react-navigation/native';
import { Buffer } from 'buffer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBoundary from './src/components/ErrorBoundary';
import AuthorizeNavigation from './src/navigators/authorizeStack';
import UnauthorizeNavigation from './src/navigators/unauthorizeStack';
import AuthProvider, { useAuth } from './src/providers/AuthProvider';
import { ThemeProvider } from './src/providers/ThemeContext';
import UserProvider from './src/providers/UserContext';
import socket from './src/utils/socket';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

const RootNavigator = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthorizeNavigation /> : <UnauthorizeNavigation />;
};

const App = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const fallbackUI = (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorText}>
        The app encountered an unexpected error. Please restart the application.
      </Text>
    </View>
  );
  useEffect(() => {
    async function init() {
      const userId = await AsyncStorage.getItem('userId');
      setUserId(userId);
      if (userId) {
        socket.connect();
        socket.emit('register', userId);
      }
    }
    init();
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary fallback={fallbackUI}>
        <GestureHandlerRootView style={styles.container}>
          <BottomSheetModalProvider>
            <SafeAreaView 
              style={StyleSheet.absoluteFill}
              edges={['right', 'bottom', 'left']}
            >
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
    </ThemeProvider>
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
