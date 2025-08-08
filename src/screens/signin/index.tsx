import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthorizeNavigation } from '../../navigators/navigators';
import { useAuth } from '../../providers/AuthProvider';
import { signInWithGitHub } from './githubSigninUtil';
import { googleSignIn } from './googleSigninUtil';
import Icons from '../../components/icons';
import { commonStyles } from '../../utils/styles'
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import LinearGradient from 'react-native-linear-gradient';


const SignInScreen = ({ navigation }) => {
  const { signInWithGoogle } = useAuth();
  const [signInForm, setSignInForm] = useState({
    email:
      process.env.ENV === 'development' ? 'parsediyarishabh@gmail.com' : '',
    password: process.env.ENV === 'development' ? 'Rishabh@123' : '',
  });
  const [error, setError] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const { signInWithPassword } = useAuth();
  const authNavigation = useAuthorizeNavigation();

  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  console.log("🚀 ~ SignInScreen ~ colors:", colors)



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
      setGithubLoading(true);
      const result = await signInWithGitHub();

      if ('success' in result) {
        throw new Error(result.error || 'Failed to sign in with GitHub');
      }

      const user = await getGitHubUser(result.accessToken);
      console.log('User signed in successfully:', user);
    } catch (error) {
      console.log('Error signing in:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in with GitHub');
    }
    finally {
      setGithubLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { success, userInfo } = await googleSignIn();
      if (success) {
        await signInWithGoogle({ idToken: userInfo?.data?.idToken || '' });
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

  const importedStyles = useMemo(() =>  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    header: {
      fontSize: 40,
      marginBottom: 10,
        ...commonStyles.textExtraBold,
        color: colors.text
      },
      subHeader: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 30,
        ...commonStyles.textMedium
      },
      scrollContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
      googleButton: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'center',
      },
      githubButton: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'center',
      },
      googleText: { fontSize: 16, color: colors.buttonText, ...commonStyles.textMedium },
      googleIcon: { marginRight: 10, ...commonStyles.textMedium, color: colors.buttonText },
      githubText: { fontSize: 16, color: colors.buttonText, ...commonStyles.textMedium },
      githubIcon: { marginRight: 10, ...commonStyles.textMedium, color: colors.buttonText },
      dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
      },
      divider: { flex: 1, height: 1 },
      or: { marginHorizontal: 12, color: colors.mutedText },
      input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
        color: colors.inputText
      },
      passwordContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginBottom: 20,
        color: colors.inputText
      },
      inputInner: {
        flex: 1,
        paddingVertical: 14,
        color: colors.inputText
      },
      continueBtn: {
        backgroundColor: colors.buttonBackground,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
      },
      continueText: { color: colors.buttonText, ...commonStyles.textMedium, fontSize: 16 },
      terms: { fontSize: 14, color: colors.mutedText, textAlign: 'left', marginBottom: 10, ...commonStyles.textMedium },
      link: { color: colors.buttonText, ...commonStyles.textMedium, fontSize: 14 },
      footer: { textAlign: 'center', color: colors.mutedText, ...commonStyles.textMedium, fontSize: 14 },
      error: { color: 'red', marginBottom: 10 },
    }), [theme])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={importedStyles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={importedStyles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={importedStyles.header}>Welcome Back</Text>
        <Text style={importedStyles.subHeader}>Sign in to continue</Text>

        <TouchableOpacity onPress={handleGitHubSignIn} style={importedStyles.googleButton}>
          <Icons.GithubIcon style={importedStyles.githubIcon} width={28} height={28} />
          <Text style={importedStyles.githubText}>{githubLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Continue with GitHub'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoogleSignIn} style={importedStyles.googleButton}>
          <Icons.GoogleIcon style={importedStyles.googleIcon} width={24} height={24} />
          <Text style={importedStyles.googleText}>{googleLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Continue with Google'}</Text>
        </TouchableOpacity>

        <View style={importedStyles.dividerContainer}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={['transparent', colors.borderLight]}
            style={importedStyles.divider}
          />

          <Text style={importedStyles.or}>or</Text>

          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[colors.borderLight, 'transparent']}
            style={importedStyles.divider}
          />
        </View>

        <TextInput
          placeholder="Email"
          value={signInForm.email}
          onChangeText={text => setSignInForm({ ...signInForm, email: text })}
          style={importedStyles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={importedStyles.passwordContainer}>
          <TextInput
            placeholder="Password"
            value={signInForm.password}
            onChangeText={text =>
              setSignInForm({ ...signInForm, password: text })
            }
            secureTextEntry={secureText}
            style={importedStyles.inputInner}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Icon
              name={secureText ? 'eye-off' : 'eye'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {error && <Text style={importedStyles.error}>{error}</Text>}

        <TouchableOpacity style={importedStyles.continueBtn} onPress={handleSignIn}>
          <Text style={importedStyles.continueText}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.buttonTextSecondary} />
            ) : (
              'Sign In'
            )}
          </Text>
        </TouchableOpacity>

        <Text style={importedStyles.terms}>
          By continuing, you agree to our{' '}
          <Text style={importedStyles.link}>Terms of Service</Text> and{' '}
          <Text style={importedStyles.link}>Privacy Policy</Text>
        </Text>

        <Text style={importedStyles.footer}>
          Don't have an account?{' '}
          <Text
            style={importedStyles.link}
            onPress={() => navigation.navigate('Signup')}>
            Sign up
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
