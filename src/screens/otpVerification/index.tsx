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
} from 'react-native';

const OtpVerificationScreen = ({navigation}) => {
  const auth = useAuth();
  const authNavigation =
    useNavigation<NavigationProp<AuthorizeNavigationStackList>>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<TextInput[]>([]);

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

  const handleVerify = () => {
    // Sign in the user
    auth.signIn();
    // Wait for authentication state to change
    useEffect(() => {
      if (auth.isAuthenticated) {
        // Navigate to AddExpense using auth navigation
        authNavigation.navigate('Home');
      }
    }, [auth.isAuthenticated]);
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

        <Text style={styles.resendWrap}>
          Didn't receive code?
          <Text style={styles.resendText}> Resend</Text>
        </Text>

        <Text style={styles.timer}>Resend code in {timer}s</Text>

        <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
          <Text style={styles.verifyText}>Verify</Text>
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
