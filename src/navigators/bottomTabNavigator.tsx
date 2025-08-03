import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AddExpense from '../screens/addExpense'; // Placeholder for Profile
import Expense from '../screens/expense';
import Home from '../screens/home';
import Profile from '../screens/profile';
import ChatScreen from '../screens/chat';

export type TabStackParamList = {
  Home: undefined;
  Expenses: undefined;
  Add: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabStackParamList>();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#5A3FFF',
        tabBarInactiveTintColor: '#4B5563',
      }}>
      <Tab.Screen
        name="Home"
        component={ChatScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={Expense}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddExpense} // Replace with actual "Add" screen
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="add" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile} // Replace with actual "Profile" screen
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 0.3,
    borderColor: '#d1d5db',
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    paddingBottom: Platform.OS === 'android' ? 4 : 0,
  },

  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5A3FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default BottomTabNavigator;
