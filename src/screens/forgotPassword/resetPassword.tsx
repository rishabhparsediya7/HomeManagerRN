import React, {useMemo, useState} from 'react';
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
import {
  useNavigation,
  NavigationProp,
  RouteProp,
} from '@react-navigation/native';
import {UnauthorizeNavigationStackList} from '../../navigators/unauthorizeStack';
import api from '../../services/api';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import {lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';

type ForgotPasswordResetRouteProp = RouteProp<
  UnauthorizeNavigationStackList,
  'ForgotPasswordReset'
>;

type Props = {
  route: ForgotPasswordResetRouteProp;
};

const ForgotPasswordResetScreen = ({route}: Props) => {
  const email = route?.params?.email;
  const otp = route?.params?.otp;
  const navigation =
    useNavigation<NavigationProp<UnauthorizeNavigationStackList>>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureNewText, setSecureNewText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);

  const colors = lightTheme;

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please enter new password and confirm it');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
      });
      const result = response.data;
      if (result.success || response.status === 200) {
        navigation.navigate('SignIn');
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err: any) {
      console.log('Reset password error:', err);
      const message =
        err.response?.data?.message ||
        'An error occurred while resetting password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContainer: {
          padding: 24,
          flexGrow: 1,
          justifyContent: 'center',
          paddingTop: Platform.OS === 'ios' ? 20 : 24,
        },
        header: {
          fontSize: 32,
          marginBottom: 8,
          ...commonStyles.textExtraBold,
          color: colors.text,
        },
        subHeader: {
          fontSize: 16,
          color: colors.text,
          marginBottom: 32,
          ...commonStyles.textMedium,
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
          borderWidth: 1,
          borderColor: colors.border,
        },
        inputInner: {
          flex: 1,
          paddingVertical: 14,
          fontSize: 14,
          ...commonStyles.textMedium,
          color: colors.inputText,
        },
        button: {
          backgroundColor: colors.buttonBackground,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginTop: 8,
          marginBottom: 20,
        },
        buttonText: {
          color: colors.buttonText,
          ...commonStyles.textMedium,
          fontSize: 16,
        },
        backButton: {
          marginTop: 16,
          alignItems: 'center',
        },
        backButtonText: {
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
      }),
    [],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Reset Password</Text>
        <Text style={styles.subHeader}>Please enter your new password</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputInner}
            placeholder="New Password"
            placeholderTextColor={colors.inputText}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={secureNewText}
          />
          <TouchableOpacity onPress={() => setSecureNewText(!secureNewText)}>
            <Icon
              name={secureNewText ? 'eye-off' : 'eye'}
              size={20}
              color={colors.mutedText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputInner}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.inputText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmText}
          />
          <TouchableOpacity
            onPress={() => setSecureConfirmText(!secureConfirmText)}>
            <Icon
              name={secureConfirmText ? 'eye-off' : 'eye'}
              size={20}
              color={colors.mutedText}
            />
          </TouchableOpacity>
        </View>

        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={loading}
          style={{marginTop: 8, marginBottom: 20}}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordResetScreen;
