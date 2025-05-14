import {useNavigation, NavigationProp} from '@react-navigation/native';
import {AuthorizeNavigationStackList} from '../../navigators/authorizeStack';
import React, {useState, useEffect, useRef} from 'react';
import {useAuth} from '../../providers/AuthProvider';
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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OtpVerificationScreen = ({navigation, route}) => {
  const email = route?.params?.email;
  const {signIn, isAuthenticated} = useAuth();
  const [loading, setLoading] = useState(false);
  const authNavigation =
    useNavigation<NavigationProp<AuthorizeNavigationStackList>>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputs = useRef<TextInput[]>([]);
  const BASE_URL = process.env.BASE_URL;
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return; // only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const result = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email,
        otp: otp.join(''),
      });
      if (result.data.success && result.data.token) {
        await AsyncStorage.setItem('token', result.data.token);
        await signIn();
      }
    } catch (error) {
      console.log('🚀 ~ handleVerify ~ error:', error);
    } finally {
      setLoading(false);
    }
    useEffect(() => {
      console.log('🚀 ~ useEffect ~ isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        authNavigation.navigate('Home');
      }
    }, [isAuthenticated]);
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const result = await axios.post(`${BASE_URL}/api/auth/resend-otp`, {
        email,
      });
      if (result.data.success) {
        setTimer(30);
      }
    } catch (error) {
      console.log('🚀 ~ handleResend ~ error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: '#fff'}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Verification</Text>
        <Text style={styles.subHeader}>We've sent a code to your email</Text>

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
              returnKeyType="next"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resendWrap} onPress={handleResend}>
          Didn't receive code?
          <Text style={styles.resendText}>
            {resendLoading ? <ActivityIndicator /> : ' Resend'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.timer}>Resend code in {timer}s</Text>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
          <Text style={styles.verifyText}>
            {loading ? <ActivityIndicator /> : 'Verify'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
  },
  resendWrap: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  resendText: {
    color: '#3366FF',
    fontWeight: '500',
  },
  timer: {
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 30,
  },
  verifyBtn: {
    backgroundColor: '#3366FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
