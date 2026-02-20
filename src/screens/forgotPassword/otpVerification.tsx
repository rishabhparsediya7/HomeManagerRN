import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {UnauthorizeNavigationStackList} from '../../navigators/unauthorizeStack';
import Button from '../../components/Button';
import {lightTheme} from '../../providers/Theme';
import api from '../../services/api';
import {commonStyles} from '../../utils/styles';

type ForgotPasswordOTPVerificationRouteProp = RouteProp<
  UnauthorizeNavigationStackList,
  'ForgotPasswordOTPVerification'
>;

type Props = {
  route: ForgotPasswordOTPVerificationRouteProp;
};

const ForgotPasswordOTPVerificationScreen = ({route}: Props) => {
  const email = route?.params?.email;
  const navigation =
    useNavigation<NavigationProp<UnauthorizeNavigationStackList>>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [error, setError] = useState('');

  const colors = lightTheme;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setIsResendEnabled(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({nativeEvent}: any, index: number) => {
    if (nativeEvent.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setError('Please enter the full 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/verify-otp', {
        email,
        otp: otpValue,
      });
      const result = response.data;
      if (result.success || response.status === 200) {
        navigation.navigate('ForgotPasswordReset', {email, otp: otpValue});
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err: any) {
      console.log('Verify OTP error:', err);
      const message =
        err.response?.data?.message || 'An error occurred while verifying OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/send-otp', {email});
      const result = response.data;
      if (result.success || response.status === 200) {
        setTimer(30);
        setIsResendEnabled(false);
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      console.log('Resend OTP error:', err);
      const message = err.response?.data?.message || 'Failed to resend OTP';
      setError(message);
    } finally {
      setResendLoading(false);
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
        otpRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 20,
        },
        otpBox: {
          width: '14.5%',
          aspectRatio: 1,
          backgroundColor: colors.inputBackground,
          borderRadius: 10,
          textAlign: 'center',
          fontSize: 20,
          ...commonStyles.textMedium,
          color: colors.inputText,
          borderWidth: 1,
          borderColor: colors.border,
        },
        resendWrap: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 10,
        },
        resendNormalText: {
          color: colors.mutedText,
          ...commonStyles.textMedium,
          fontSize: 14,
        },
        resendText: {
          color: colors.buttonText,
          ...commonStyles.textMedium,
          fontSize: 14,
        },
        disabledResendText: {
          color: colors.border,
        },
        timer: {
          color: colors.mutedText,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 32,
          marginTop: 8,
          ...commonStyles.textMedium,
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
        <Text style={styles.subHeader}>We've sent a code to {email}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref: TextInput | null) => {
                if (ref) {
                  inputs.current[index] = ref;
                }
              }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              returnKeyType={index === 5 ? 'done' : 'next'}
            />
          ))}
        </View>

        <View style={styles.resendWrap}>
          <Text style={styles.resendNormalText}>Didn't receive code? </Text>
          <TouchableOpacity disabled={!isResendEnabled} onPress={handleResend}>
            <Text
              style={[
                styles.resendText,
                !isResendEnabled && styles.disabledResendText,
              ]}>
              {resendLoading ? (
                <ActivityIndicator size="small" color={colors.buttonText} />
              ) : (
                'Resend'
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.timer}>Resend code in {timer}s</Text>

        <Button
          title="Verify OTP"
          onPress={handleVerifyOTP}
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

export default ForgotPasswordOTPVerificationScreen;
