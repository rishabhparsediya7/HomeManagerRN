import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthorizeNavigationStackList } from './authorizeStack';
import { UnauthorizeNavigationStackList } from './unauthorizeStack';

export const useAuthorizeNavigation = () =>
  useNavigation<StackNavigationProp<AuthorizeNavigationStackList>>();

export const useUnauthorizeNavigation = () =>
  useNavigation<StackNavigationProp<UnauthorizeNavigationStackList>>();
