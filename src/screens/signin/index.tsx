import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../providers/AuthProvider';
import {useAuthorizeNavigation} from '../../navigators/navigators';
import { signInWithGoogle } from './googleSigninUtil';
import { signInWithGitHub } from './githubSigninUtil';


const SignInScreen = ({navigation}) => {
  const [signInForm, setSignInForm] = useState({
    email:
      process.env.ENV === 'development' ? 'parsediyarishabh@gmail.com' : '',
    password: process.env.ENV === 'development' ? 'Rishabh@123' : '',
  });
  const [error, setError] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const {signInWithPassword} = useAuth();
  const authNavigation = useAuthorizeNavigation();

  const handleSignIn = async () => {
    if (!signInForm.email || !signInForm.password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const user = await signInWithPassword({
        email: signInForm.email,
        password: signInForm.password,
      });
      console.log(user);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    authNavigation.navigate('BottomTabNavigator');
  };

  const getGitHubUser = async (accessToken: string) => {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return await res.json()
  }

  const handleGitHubSignIn = async () => {
    try {
      const result = await signInWithGitHub();
      if (!result?.accessToken) {
        throw new Error('Failed to sign in');
      }
      const user = await getGitHubUser(result?.accessToken);
      console.log('User signed in successfully:', user);
    } catch (error) {
      console.log('Error signing in:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const {success, userInfo} = await signInWithGoogle();
      if (success) {
        console.log('User signed in successfully:', userInfo);
      } else {
        console.log('Failed to sign in:', userInfo);
      }
    } catch (error) {
      console.log('Error signing in:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Welcome Back</Text>
        <Text style={styles.subHeader}>Sign in to continue</Text>

        <TouchableOpacity onPress={handleGitHubSignIn} style={styles.googleButton}>
          <Text style={styles.googleText}>Continue with GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButton}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.or}>or</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          placeholder="Email"
          value={signInForm.email}
          onChangeText={text => setSignInForm({...signInForm, email: text})}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={signInForm.password}
            onChangeText={text =>
              setSignInForm({...signInForm, password: text})
            }
            secureTextEntry={secureText}
            style={styles.inputInner}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Icon
              name={secureText ? 'eye-off' : 'eye'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.continueBtn} onPress={handleSignIn}>
          <Text style={styles.continueText}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              'Sign In'
            )}
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>

        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Signup')}>
            Sign up
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContainer: {padding: 24, justifyContent: 'center', flexGrow: 1},
  header: {fontSize: 28, fontWeight: 'bold', marginBottom: 10},
  subHeader: {fontSize: 16, color: '#888', marginBottom: 30},
  googleButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  googleText: {fontSize: 16},
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {flex: 1, height: 1, backgroundColor: '#ddd'},
  or: {marginHorizontal: 10, color: '#888'},
  input: {
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
  },
  continueBtn: {
    backgroundColor: '#3366FF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueText: {color: '#fff', fontWeight: 'bold'},
  terms: {fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 10},
  link: {color: '#3366FF'},
  footer: {textAlign: 'center', color: '#888'},
  error: {color: 'red', marginBottom: 10},
});
