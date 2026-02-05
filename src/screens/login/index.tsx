import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../providers/AuthProvider';
import {resize} from '../../utils/deviceDimentions';
import {useAuthorizeNavigation} from '../../navigators/navigators';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Login = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [signInMethod, setSignInMethod] = useState('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSigninLoading, setOtpSigninLoading] = useState(false);
  const {signInWithPassword, signIn, signupWithPassword} = useAuth();
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const navigation = useAuthorizeNavigation();
  //   const {
  //     googleSignIn,
  //     signInWithPassword,
  //     signupWithPassword,
  //     user,
  //     loading,
  //     error,
  //   } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    try {
      //   await googleSignIn();
    } catch (err) {
      console.error('Google sign in error', err);
    }
  };

  const handleSignUp = async () => {
    try {
      const result = await signupWithPassword({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      if (result.success) {
        await AsyncStorage.setItem('token', result.token);
        signIn();
      }
    } catch (err) {
      console.error('Sign up error', err);
    }
  };

  const handleSendOTP = async () => {
    setOtpSigninLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/send-otp`,
        {
          method: 'POST',
          body: JSON.stringify({email}),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const result = await response.json();
      setOtpSent(true);
    } catch (error) {
      console.log('OTP send error:', error);
    } finally {
      setOtpSigninLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    try {
      const result = await signInWithPassword({email, password});
      // if (result.success) {
      //   await AsyncStorage.setItem('token', result.token);
      signIn();
      // }
    } catch (err) {
      console.error('Sign in error', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'signin'
            ? 'Sign in to your account'
            : 'Create a new account'}
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* Tab switch */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'signin' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('signin')}>
            <Text
              style={
                activeTab === 'signin' ? styles.activeText : styles.inactiveText
              }>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'signup' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('signup')}>
            <Text
              style={
                activeTab === 'signup' ? styles.activeText : styles.inactiveText
              }>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'signin' ? (
          <>
            {/* Sign In Method toggle */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  signInMethod === 'password' && styles.activeTab,
                ]}
                onPress={() => setSignInMethod('password')}>
                <Icon name="lock-closed" size={resize(18)} color="black" />
                <Text
                  style={
                    signInMethod === 'password'
                      ? styles.activeText
                      : styles.inactiveText
                  }>
                  Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  signInMethod === 'otp' && styles.activeTab,
                ]}
                onPress={() => setSignInMethod('otp')}>
                <Icon name="mail" size={resize(18)} color="black" />
                <Text
                  style={[
                    signInMethod === 'otp'
                      ? styles.activeText
                      : styles.inactiveText,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  ]}>
                  Email OTP
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {signInMethod === 'password' ? (
              <View style={styles.passwordInputContainer}>
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}>
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {!otpSent ? (
                  <TouchableOpacity
                    onPress={handleSendOTP}
                    style={styles.button}>
                    {otpSigninLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    style={styles.input}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                )}
              </>
            )}

            <TouchableOpacity onPress={handleSignIn} style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              style={styles.outlineButton}>
              <Text style={styles.outlineText}>Continue with Google</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              placeholder="First Name"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeIcon}>
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSignUp} style={styles.button}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 8,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    gap: resize(6),
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: '#e4e4e4',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderColor: '#333',
    borderWidth: 1,
  },
  activeText: {
    fontWeight: 'bold',
    color: '#333',
  },
  inactiveText: {
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  outlineButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  outlineText: {
    textAlign: 'center',
    color: '#444',
  },
});

export default Login;
