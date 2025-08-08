import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../services/api';

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
  signInWithGoogle: (params: {
    idToken: string;
  }) => Promise<any>;
  signupWithPassword: (params: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<any>;
  user: UserProps;
};

type UserProps = {
  name: string;
  photoUrl: string;
  userId: string;
  loggedIn: boolean;
  token: string;
  email: string;
};

interface AuthContextProps {
  googleSignIn: () => void;
  logOut: () => void;
  signInWithPassword: (params: {
    email: string;
    password: string;
  }) => Promise<any>;
  signInWithGoogle: (params: {
    idToken: string;
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
  signInWithGoogle: () => Promise.resolve(),
  user: {
    name: '',
    photoUrl: '',
    userId: '',
    loggedIn: false,
    token: '',
    email: '',
  },
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<UserProps>({
    name: '',
    photoUrl: '',
    userId: '',
    loggedIn: false,
    token: '',
    email: '',
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
        { email, password, first_name, last_name },
      );
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName: first_name,
          lastName: last_name,
        }),
        headers: {
          'content-type': 'application/json',
        },
      });
      const result = await response.json();
      console.log('🚀 ~ AuthProvider ~ result:', result);
      if (result.success) {
        await Promise.all([
          AsyncStorage.setItem('userId', result.userId),
          AsyncStorage.setItem('token', result.token),
        ]);
        setUser({
          userId: result?.userId || '',
          email: result?.email || '',
          name: first_name + ' ' + last_name || '',
          photoUrl: result?.photoUrl || '',
          token: result?.token || '',
          loggedIn: true,
        });
        return result;
      } else {
        throw new Error(result.message);
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
      const BASE_URL = process.env.BASE_URL;
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
          'content-type': 'application/json',
        },
      });
      const result = await response.json();
      const { userId, token, name } = result;
      if (result.success && result.token) {
        setIsAuthenticated(true);
        await Promise.all([
          AsyncStorage.setItem('userId', userId),
          AsyncStorage.setItem('token', token),
        ]);
        setUser({
          userId: userId || '',
          name: name || '',
          photoUrl: result?.photoUrl || '',
          token: token || '',
          loggedIn: true,
          email: email || '',
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

  const signInWithGoogle = async ({ idToken }: { idToken: string }) => {
    console.log("🚀 ~ signInWithGoogle ~ idToken:", idToken)
    setLoading(true);
    try {
      if (!idToken) {
        throw new Error('ID token is required');
      }
      const BASE_URL = process.env.BASE_URL;
      console.log("🚀 ~ signInWithGoogle ~ BASE_URL:", BASE_URL)
      const response = await fetch(`${BASE_URL}/api/auth/signin-with-google`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'id-token': idToken,
        },
      });
      console.log("🚀 ~ signInWithGoogle ~ response:", response)
      const result = await response.json();
      console.log("🚀 ~ signInWithGoogle ~ result:", result)
      const { userId, token, name } = result;
      if (result.success && result.token) {
        setIsAuthenticated(true);
        await Promise.all([
          AsyncStorage.setItem('userId', userId),
          AsyncStorage.setItem('token', token),
        ]);
        setUser({
          userId: userId || '',
          name: name || '',
          photoUrl: result?.photoUrl || '',
          token: token || '',
          loggedIn: true,
          email: result?.email || '',
        });
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
      console.log("🚀 ~ signInWithGoogle ~ loading:", loading)
    }
  };

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    fetchAuthStatus();
    if (isAuthenticated) {
      getUser();
    }
  }, [isAuthenticated]);

  const getUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/me');
      setUser({
        ...user,
        photoUrl: response.data.user.photoUrl,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  
  const signIn = async () => setIsAuthenticated(true);
  const signOut = async () => {
    await AsyncStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        isAuthenticated,
        signInWithPassword,
        signupWithPassword,
        signInWithGoogle,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
