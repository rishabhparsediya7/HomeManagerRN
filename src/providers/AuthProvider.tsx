import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import {useAuthorizeNavigation} from '../navigators/navigators';

type AuthContext = {
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading?: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<any>;
  signupWithPassword: (params: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<any>;
};

type UserProps = {
  name: string;
  photoUrl: string;
  userId: string;
  loggedIn: boolean;
  token: string;
};

interface AuthContextProps {
  googleSignIn: () => void;
  logOut: () => void;
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<any>;
  signupWithPassword: (params: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  user: UserProps;
  loading: boolean;
  error: string;
}

const AuthContext = createContext<AuthContext>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  signInWithPassword: () => Promise.resolve(),
  signupWithPassword: () => Promise.resolve(),
});

export default function AuthProvider({children}: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<UserProps>({
    name: '',
    photoUrl: '',
    userId: '',
    loggedIn: false,
    token: '',
  });

  const signupWithPassword = async ({
    email,
    password,
    first_name,
    last_name,
  }: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    setLoading(true);
    try {
      console.log('BASE_URL', BASE_URL);
      console.log(
        `🚀 ~ AuthProvider ~ {email, password, first_name, last_name}:`,
        {email, password, first_name, last_name},
      );
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({email, password, first_name, last_name}),
        headers: {
          'content-type': 'application/json',
        },
      });
      const result = await response.json();
      console.log('🚀 ~ signupWithPassword ~ result:', result);
      if (result.success) {
        setIsAuthenticated(true);
        await Promise.all([
          AsyncStorage.setItem('userId', result.userId),
          AsyncStorage.setItem('token', result.token),
          AsyncStorage.setItem('isLoggedIn', true.toString()),
        ]);
        setUser({
          userId: result?.userId || '',
          name: first_name + ' ' + last_name || '',
          photoUrl: result?.photoUrl || '',
          token: result?.token || '',
          loggedIn: true,
        });
        return result;
      } else {
        throw new Error('Could not sign up with password!');
      }
    } catch (error) {
      console.log('🚀 ~ signupWithPassword ~ error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      console.log(BASE_URL);
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({email, password}),
        headers: {
          'content-type': 'application/json',
        },
      });
      const result = await response.json();
      const {userId, token} = result;
      if (result.success) {
        setIsAuthenticated(true);
        await Promise.all([
          AsyncStorage.setItem('userId', userId),
          AsyncStorage.setItem('token', token),
          AsyncStorage.setItem('isLoggedIn', true.toString()),
          AsyncStorage.setItem('name', result?.name),
          AsyncStorage.setItem('photoUrl', result?.photoUrl || ''),
        ]);
        setUser({
          userId: result?.userId || '',
          name: result?.name || '',
          photoUrl: result?.photoUrl || '',
          token: result?.token || '',
          loggedIn: true,
        });
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const fetchAuthStatus = async () => {
  //     const token = await AsyncStorage.getItem('token');
  //     setIsAuthenticated(!!token);
  //   };

  //   fetchAuthStatus();
  // }, [isAuthenticated]);

  const signIn = () => setIsAuthenticated(true);
  const signOut = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        isAuthenticated,
        signInWithPassword,
        signupWithPassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
