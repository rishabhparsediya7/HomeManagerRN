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
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

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
  setUser: (user: UserProps) => void;
};


type UserProps = {
  name: string;
  photoUrl: string;
  userId: string;
  loggedIn: boolean;
  token: string;
  email: string;
  budget: number;
  income: number;
  phoneNumber: string;
  userLoginProvider: string;
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
  setUser: (user: UserProps) => void;
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
    budget: 0,
    income: 0,
    phoneNumber: '',
    userLoginProvider: '',
  },
  setUser: () => null,
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
    budget: 0,
    income: 0,
    phoneNumber: '',
    userLoginProvider: '',
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
          budget: result?.budget || 0,
          income: result?.income || 0,
          phoneNumber: result?.phoneNumber || '',
          userLoginProvider: result?.userLoginProvider || '',
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
          budget: result?.budget || 0,
          income: result?.income || 0,
          phoneNumber: result?.phoneNumber || '',
          userLoginProvider: result?.userLoginProvider || '',
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
    setLoading(true);
    try {
      if (!idToken) {
        throw new Error('ID token is required');
      }
      const BASE_URL = process.env.BASE_URL;
      const response = await fetch(`${BASE_URL}/api/auth/signin-with-google`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'id-token': idToken,
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
          email: result?.email || '',
          budget: result?.budget || 0,
          income: result?.income || 0,
          phoneNumber: result?.phoneNumber || '',
          userLoginProvider: result?.userLoginProvider || '',
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
        name: response.data?.user?.name,
        photoUrl: response.data?.user?.profilePicture,
        userId: response.data?.user?.id,
        loggedIn: true,
        token: response.data?.user?.token,
        email: response.data?.user?.email,
        budget: response.data?.user?.budget,
        income: response.data?.user?.income,
        phoneNumber: response.data?.user?.phoneNumber,
        userLoginProvider: response.data?.user?.userLoginProvider,
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
    if(GoogleSignin){
      GoogleSignin.signOut();
    }
    setIsAuthenticated(false);
    setUser({
      name: '',
      photoUrl: '',
      userId: '',
      loggedIn: false,
      token: '',
      email: '',
      budget: 0,
      income: 0,
      phoneNumber: '',
      userLoginProvider: '',
    });
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
        setUser,
        signInWithGoogle,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
