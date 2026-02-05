import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar, Platform} from 'react-native';
import {useTheme} from '../providers/ThemeContext';
import BottomTabNavigator from './bottomTabNavigator';
import {RouteProp} from '@react-navigation/native';
import Dashboard from '../screens/dashboard';
import Home from '../screens/home';
import AddExpense from '../screens/addExpense';
import ChatScreen from '../screens/chat';
import FriendChatScreen from '../screens/chat/friendChat';
import ActionScreen from '../screens/action/addFinanceSummary';
import EditPersonalInformation from '../screens/action/editPersonalInformation';
import UpdatePassword from '../screens/action/updatePassword';
import ExportData from '../screens/action/exportData';
// Split Expense Screens
import SplitExpenseList from '../screens/splitExpense';
import CreateSplitExpense from '../screens/splitExpense/create';
import SplitExpenseDetail from '../screens/splitExpense/detail';
import SettlementScreen from '../screens/splitExpense/settle';
import BalancesScreen from '../screens/splitExpense/balances';

type ActionType = 'income' | 'bills' | 'budget' | null;

export type AuthorizeNavigationStackList = {
  BottomTabNavigator: undefined;
  Home: undefined;
  Dashboard: undefined;
  AddExpense: undefined;
  Chat: undefined;
  FriendChat: {
    id: string;
    firstName: string;
    lastName: string;
    image: string;
    lastMessage: string;
    lastMessageTime: string;
  };
  Action: {type: ActionType};
  EditPersonalInformation: undefined;
  UpdatePassword: undefined;
  ExportData: undefined;
  // Split Expense routes
  SplitExpenseList: undefined;
  CreateSplitExpense: {preselectedFriends?: string[]} | undefined;
  SplitExpenseDetail: {splitExpenseId: string};
  SettlementScreen: {
    splitExpenseId: string;
    friendId: string;
    friendName: string;
    amountOwed: number;
    payerId: string;
    payeeId: string;
  };
  Balances: undefined;
};

export type AuthorizeNavigationProp<
  RouteName extends keyof AuthorizeNavigationStackList,
> = RouteProp<AuthorizeNavigationStackList, RouteName>;

const AuthorizeNavigationStack =
  createStackNavigator<AuthorizeNavigationStackList>();
const AuthorizeNavigation = () => {
  const {theme} = useTheme();
  const isDark = theme === 'dark';

  // Update status bar style based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', false);
      StatusBar.setTranslucent(false);
    }
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  return (
    <AuthorizeNavigationStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <AuthorizeNavigationStack.Screen
        name="BottomTabNavigator"
        component={BottomTabNavigator}
      />
      <AuthorizeNavigationStack.Screen
        name="AddExpense"
        component={AddExpense}
      />
      <AuthorizeNavigationStack.Screen name="Home" component={Home} />
      <AuthorizeNavigationStack.Screen name="Dashboard" component={Dashboard} />
      <AuthorizeNavigationStack.Screen name="Chat" component={ChatScreen} />
      <AuthorizeNavigationStack.Screen
        name="FriendChat"
        component={FriendChatScreen}
      />
      <AuthorizeNavigationStack.Screen name="Action" component={ActionScreen} />
      <AuthorizeNavigationStack.Screen
        name="EditPersonalInformation"
        component={EditPersonalInformation}
      />
      <AuthorizeNavigationStack.Screen
        name="UpdatePassword"
        component={UpdatePassword}
      />
      <AuthorizeNavigationStack.Screen
        name="ExportData"
        component={ExportData}
      />
      {/* Split Expense Screens */}
      <AuthorizeNavigationStack.Screen
        name="SplitExpenseList"
        component={SplitExpenseList}
      />
      <AuthorizeNavigationStack.Screen
        name="CreateSplitExpense"
        component={CreateSplitExpense}
      />
      <AuthorizeNavigationStack.Screen
        name="SplitExpenseDetail"
        component={SplitExpenseDetail}
      />
      <AuthorizeNavigationStack.Screen
        name="SettlementScreen"
        component={SettlementScreen}
      />
      <AuthorizeNavigationStack.Screen
        name="Balances"
        component={BalancesScreen}
      />
    </AuthorizeNavigationStack.Navigator>
  );
};

export default AuthorizeNavigation;
