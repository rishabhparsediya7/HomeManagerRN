import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import {useAuth} from '../../providers/AuthProvider';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import {commonStyles} from '../../utils/styles';
import api from '../../services/api';

const UpdatePassword = ({navigation}) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [error, setError] = useState('');
  const {user} = useAuth();
  const [passwordToggler, showPasswordToggler] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: '',
  });

  const handleFocus = () => {
    setError('');
  };

  const togglePasswordVisibility = (type: 'current' | 'new' | 'confirm') => {
    showPasswordToggler(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleUpdatePassword = async () => {
    setLoading(true);
    try {
        const response = await api.put('/api/auth/update-password', {
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            ...(user.userLoginProvider === 'email' && { currentPassword: formData.currentPassword }),
        });
        if(response.status === 200){
            setFormData({
                currentPassword: '',
                password: '',
                confirmPassword: '',
            })
            navigation.canGoBack() && navigation.goBack();
        }
    } catch (error) {
        console.log('🚀 ~ handleUpdatePassword ~ error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerText: {
      fontSize: 28,
      ...commonStyles.textExtraBold,
      color: colors.buttonText,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    profileContainer: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 16,
      gap: 16,
    },
    inputGroup: {
      flexDirection:'column',
      width: '100%',
      gap: 8,
      position:'relative'
    },
    label: {
      ...commonStyles.textDefault,
      color: colors.inputText,
      fontSize: 16,
    },
    input: {
      color: colors.inputText,
      ...commonStyles.textDefault,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBackground,
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      width: '100%',
    },
    buttonText: {
      ...commonStyles.textDefault,
      color: colors.buttonText,
      fontSize: 16,
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      ...commonStyles.textDefault,
    },
    eyeIcon: {
      position: 'absolute',
      right: 12,
      top: 44,
    },
  });

  return (
    <View style={styles.container}>
      <Header
        showImage={false}
        headerTitleStyle={styles.headerText}
        showBackButton
        title="Update Password"
        onBackPress={handleBackPress}
      />
      <View style={styles.content}>
        <View style={styles.profileContainer}>
          {user.userLoginProvider === 'email' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current password</Text>
              <TextInput
                placeholder="Enter current password"
                style={styles.input}
                placeholderTextColor={colors.inputText}
                value={formData.currentPassword}
                secureTextEntry={!passwordToggler.current}
                onFocus={handleFocus}
                onChangeText={text =>
                  setFormData({...formData, currentPassword: text})
                }
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('current')}
                style={styles.eyeIcon}>
                <Icon name={passwordToggler.current ? 'eye-off' : 'eye'} color={colors.inputText} size={20} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter new password"
              style={styles.input}
              placeholderTextColor={colors.inputText}
              value={formData.password}
              secureTextEntry={!passwordToggler.new}
              onFocus={handleFocus}
              onChangeText={text => setFormData({...formData, password: text})}
            />
            <TouchableOpacity
                onPress={() => togglePasswordVisibility('new')}
                style={styles.eyeIcon}>
                <Icon name={passwordToggler.new ? 'eye-off' : 'eye'} color={colors.inputText} size={20} />
              </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              placeholder="Enter Confirm Password"
              style={styles.input}
              secureTextEntry={!passwordToggler.confirm}
              placeholderTextColor={colors.inputText}
              value={formData.confirmPassword}
              onChangeText={text =>
                setFormData({...formData, confirmPassword: text})
              }
              onFocus={handleFocus}
            />
            <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirm')}
                style={styles.eyeIcon}>
                <Icon name={passwordToggler.confirm ? 'eye-off' : 'eye'} color={colors.inputText} size={20} />
              </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.7}
            onPress={handleUpdatePassword}>
            <Text style={styles.buttonText}>
              {loading ? (
                <ActivityIndicator color={colors.buttonText} />
              ) : (
                `Update`
              )}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>
    </View>
  );
};

export default UpdatePassword;
