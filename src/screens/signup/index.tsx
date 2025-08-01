import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../providers/AuthProvider';
import Icons from '../../components/icons';
import { googleSignIn } from '../../screens/signin/googleSigninUtil';

const SignUpScreen = ({navigation}) => {
  const {signupWithPassword, signInWithGoogle} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [signUpForm, setSignUpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',  
    password: '',
    confirmPassword: '',
    firstNameError: '',
    lastNameError: '',
    emailError: '',
    passwordError: '',
    confirmPasswordError: '',
  });

  const handleSignUp = async () => {
    setSignUpForm({
      ...signUpForm,
      firstNameError: '',
      lastNameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
    });
    const {firstName, lastName, email, password, confirmPassword} = signUpForm;
    if (!firstName) {
      setSignUpForm({
        ...signUpForm,
        firstNameError: 'First name is required',
      });
      return;
    }
    if (!lastName) {
      setSignUpForm({
        ...signUpForm,
        lastNameError: 'Last name is required',
      });
      return;
    }
    if (!email) {
      setSignUpForm({
        ...signUpForm,
        emailError: 'Email is required',
      });
      return;
    }
    const isValidEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
      email,
    );

    if (!isValidEmail) {
      setSignUpForm({
        ...signUpForm,
        emailError: 'Invalid email address',
      });
      return;
    }

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    const isValidPassword = regex.test(password);

    if (!isValidPassword) {
      setSignUpForm({
        ...signUpForm,
        passwordError:
          'Password should be between 8 and 16 characters long and contain at least one special character, one uppercase letter, one lowercase letter, and one number',
      });
      return;
    }

    if (!password) {
      setSignUpForm({
        ...signUpForm,
        passwordError: 'Password is required',
      });
      return;
    }
    if (!confirmPassword) {
      setSignUpForm({
        ...signUpForm,
        confirmPasswordError: 'Password is required',
      });
      return;
    }

    if (password !== confirmPassword) {
      setSignUpForm({
        ...signUpForm,
        confirmPasswordError: 'Passwords do not match',
      });
      return;
    }

    setSignUpForm({
      ...signUpForm,
      firstNameError: '',
      lastNameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
    });

    setLoading(true);
    try {
      const result = await signupWithPassword({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      console.log(result);
      if (result.success) {
        navigation.navigate('OTPVerification', {email});
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const {success, userInfo} = await googleSignIn();
      if (success) {
        console.log("🚀 ~ handleGoogleSignup ~ success:", success)
        await signInWithGoogle({idToken: userInfo?.data?.idToken || ''});
        console.log('User signed in successfully:', userInfo);
      } else {
        console.log('Failed to sign in:', userInfo);
      }
    } catch (error) {
      console.log('Error signing in:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
    }
    finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Please fill in the information below to create your account
          </Text>
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={signUpForm.firstName}
            onChangeText={text =>
              setSignUpForm({...signUpForm, firstName: text})
            }
          />
          {signUpForm.firstNameError && (
            <Text style={styles.error}>{signUpForm.firstNameError}</Text>
          )}

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your last name"
            value={signUpForm.lastName}
            onChangeText={text =>
              setSignUpForm({...signUpForm, lastName: text})
            }
          />
          {signUpForm.lastNameError && (
            <Text style={styles.error}>{signUpForm.lastNameError}</Text>
          )}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={signUpForm.email}
            onChangeText={text => setSignUpForm({...signUpForm, email: text})}
            keyboardType="email-address"
          />
          {signUpForm.emailError && (
            <Text style={styles.error}>{signUpForm.emailError}</Text>
          )}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputInner}
              placeholder="Create a password"
              secureTextEntry={secureText}
              value={signUpForm.password}
              onChangeText={text =>
                setSignUpForm({...signUpForm, password: text})
              }
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Icon
                name={secureText ? 'eye-off' : 'eye'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {signUpForm.passwordError && (
            <Text style={styles.error}>{signUpForm.passwordError}</Text>
          )}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.inputInner}
              placeholder="Confirm your password"
              secureTextEntry={secureText}
              value={signUpForm.confirmPassword}
              onChangeText={text =>
                setSignUpForm({...signUpForm, confirmPassword: text})
              }
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Icon
                name={secureText ? 'eye-off' : 'eye'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {signUpForm.confirmPasswordError && (
            <Text style={styles.error}>{signUpForm.confirmPasswordError}</Text>
          )}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpText}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                'Sign Up'
              )}
            </Text>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or sign up with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={handleGoogleSignup} style={styles.socialButton}>
              <Icons.GoogleIcon width={24} height={24} color="black" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={{color: '#2e6eff'}}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  label: {
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
  },
  signUpButton: {
    backgroundColor: '#2e6eff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signUpText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  socialButton: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
    flex: 1,
  },
  signInText: {
    textAlign: 'center',
    color: '#666',
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
});

export default SignUpScreen;
