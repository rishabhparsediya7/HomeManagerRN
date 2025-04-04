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

  const signInWithPassword = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({email, password}),
          headers: {
            'content-type': 'application/json',
          },
        },
      );
      const result = await response.json();
      const {userId, token} = result;
      if (result.success) {
        localStorage.setItem('userId', userId);
        localStorage.setItem('token', token);
        localStorage.setItem('isLoggedIn', true.toString());
        localStorage.setItem('name', result?.name);
        localStorage.setItem('photoUrl', result?.photoUrl || '');
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

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    fetchAuthStatus();
  }, [isAuthenticated]);

  const signIn = () => setIsAuthenticated(true);
  const signOut = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{signIn, signOut, isAuthenticated, signInWithPassword}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
