import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {COLORS} from '../providers/theme.style';
import {useTheme} from '@react-navigation/native';
import Login from '../screens/login';
import {resize} from '../utils/deviceDimentions';
import Dashboard from '../screens/dashboard';
import Home from '../screens/home';
import Icon from 'react-native-vector-icons/Ionicons';
export type TabStackParamList = {
  Home: undefined;
  Dashboard: undefined;
};

type TabParamList = keyof TabStackParamList;

export const TabScreens: {[K in TabParamList]: K} = {
  Home: 'Home',
  Dashboard: 'Dashboard',
};

const Tab = createBottomTabNavigator<TabStackParamList>();

const hideTabBarRoutes = [
  '/groups/createGroup',
  '/addExpense',
  '/contacts/contactList',
  '/contacts/selectedContactList',
];

// const renderTabs = (props: BottomTabBarProps) => <CustomTabBar {...props} />;

const BottomTabNavigator = () => {
  const pathName = '';
  const theme = useTheme();
  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: resize(60),
          display: hideTabBarRoutes.includes(pathName) ? 'none' : 'flex',
          backgroundColor: COLORS.primary,
        },
        tabBarActiveTintColor: COLORS.white,
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
        component={Home}
      />
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="analytics-outline" color={color} size={size} />
          ),
        }}
        component={Dashboard}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
