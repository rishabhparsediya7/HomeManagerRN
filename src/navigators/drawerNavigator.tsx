import {createDrawerNavigator} from '@react-navigation/drawer';
import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import CustomDrawerContent from '../components/CustomDrawerContent';
import BottomTabNavigator from './bottomTabNavigator';

export type DrawerParamList = {
  MainTabs: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait 2 frames before mounting the drawer to avoid the flash
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Render tabs directly without the drawer wrapper on first frames
  if (!isReady) {
    return (
      <View style={styles.container}>
        <BottomTabNavigator />
      </View>
    );
  }

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      defaultStatus="closed"
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: {
          width: '75%',
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },
        sceneStyle: {
          backgroundColor: 'transparent',
        },
      }}>
      <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DrawerNavigator;
