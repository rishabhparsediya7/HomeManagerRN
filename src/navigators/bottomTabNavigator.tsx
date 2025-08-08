// BottomTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import CustomTabBar from '../components/customTabBar/CustomTabBar';

import Home from '../screens/home';
import Expense from '../screens/expense';
import AddExpense from '../screens/addExpense';
import ChatScreen from '../screens/chat';
import Profile from '../screens/profile';

export type TabStackParamList = {
  Home: undefined;
  Expenses: undefined;
  Add: undefined;
  Chat: undefined;
  Profile: undefined;
};
const Tab = createBottomTabNavigator<TabStackParamList>();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Expenses" component={Expense} />
      <Tab.Screen name="Add" component={AddExpense} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;