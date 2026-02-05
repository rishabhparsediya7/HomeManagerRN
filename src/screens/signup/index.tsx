import React, {useMemo, useState} from 'react';
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
import {googleSignIn} from '../../screens/signin/googleSigninUtil';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';
import LinearGradient from 'react-native-linear-gradient';

const SignUpScreen = ({navigation}) => {
  const {signupWithPassword, signInWithGoogle} = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

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
        await signInWithGoogle({idToken: userInfo?.data?.idToken || ''});
      } else {
        console.log('Failed to sign in:', userInfo);
      }
    } catch (error) {
      console.log('Error signing in:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Google',
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContainer: {
          padding: 24,
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: Platform.OS === 'ios' ? 20 : 24,
        },
        title: {
          ...commonStyles.textExtraBold,
          color: colors.text,
          marginBottom: 8,
          fontSize: 32,
        },
        subtitle: {
          ...commonStyles.textMedium,
          color: colors.text,
          marginBottom: 24,
        },
        label: {
          marginBottom: 6,
          color: colors.text,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
        input: {
          backgroundColor: colors.inputBackground,
          padding: 14,
          borderRadius: 10,
          marginBottom: 18,
          fontSize: 14,
          ...commonStyles.textMedium,
          color: colors.inputText,
        },
        passwordContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
          paddingHorizontal: 14,
          borderRadius: 10,
          marginBottom: 18,
          fontSize: 14,
          ...commonStyles.textMedium,
          color: colors.inputText,
        },
        inputInner: {
          flex: 1,
          paddingVertical: 14,
          fontSize: 14,
          ...commonStyles.textMedium,
        },
        signUpButton: {
          backgroundColor: colors.buttonBackground,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 20,
        },
        signUpText: {
          color: colors.buttonText,
          ...commonStyles.textMedium,
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
          backgroundColor: colors.mutedText,
        },
        orText: {
          marginHorizontal: 10,
          color: colors.mutedText,
        },
        dividerContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        },
        divider: {flex: 1, height: 1},
        or: {
          marginHorizontal: 12,
          color: colors.mutedText,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
        socialContainer: {
          flexDirection: 'row',
          marginBottom: 32,
          gap: 16,
        },
        socialButton: {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
          borderWidth: 1,
          padding: 16,
          borderRadius: 10,
          width: '30%',
          flex: 1,
        },
        socialButtonText: {
          color: colors.text,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
        signInText: {
          textAlign: 'center',
          color: colors.mutedText,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
        error: {
          color: colors.error,
          marginBottom: 16,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
        signInLink: {
          color: colors.buttonText,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
      }),
    [theme],
  );

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
            placeholderTextColor={colors.inputText}
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
            placeholderTextColor={colors.inputText}
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
            placeholderTextColor={colors.inputText}
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
              placeholderTextColor={colors.inputText}
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
              placeholderTextColor={colors.inputText}
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

          <View style={styles.dividerContainer}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['transparent', colors.borderLight]}
              style={styles.divider}
            />

            <Text style={styles.or}>or</Text>

            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.borderLight, 'transparent']}
              style={styles.divider}
            />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              onPress={handleGoogleSignup}
              style={styles.socialButton}>
              <Icons.GoogleIcon width={24} height={24} color="black" />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
