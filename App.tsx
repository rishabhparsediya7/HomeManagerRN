import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
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
  );
};

export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
