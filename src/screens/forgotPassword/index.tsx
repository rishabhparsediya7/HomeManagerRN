import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Button from '../../components/Button';
import {UnauthorizeNavigationStackList} from '../../navigators/unauthorizeStack';
import {lightTheme} from '../../providers/Theme';
import api from '../../services/api';
import {commonStyles} from '../../utils/styles';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation =
    useNavigation<NavigationProp<UnauthorizeNavigationStackList>>();

  const colors = lightTheme;

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/send-otp', {email});
      const result = response.data;

      if (result.success || response.status === 200) {
        navigation.navigate('ForgotPasswordOTPVerification', {email});
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.log('OTP send error:', err);
      // Use the error message from the backend if available
      const message =
        err.response?.data?.message || 'An error occurred while sending OTP';
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
        input: {
          backgroundColor: colors.inputBackground,
          padding: 14,
          borderRadius: 10,
          marginBottom: 20,
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Forgot Password</Text>
        <Text style={styles.subHeader}>
          Enter your email to receive an OTP to reset your password.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.inputText}
        />

        <Button
          title="Send OTP"
          onPress={handleSendOTP}
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

export default ForgotPassword;
