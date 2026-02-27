import {ScrollView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import Header from '../../components/Header';
import {commonStyles} from '../../utils/styles';
import {useAuth} from '../../providers/AuthProvider';
import api from '../../services/api';
import AppInput from '../../components/common/AppInput';
import Button from '../../components/Button';
import AppText from '../../components/common/AppText';

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
}

const EditPersonalInformation = ({navigation}: {navigation: any}) => {
  const {theme} = useTheme();
  const {user, setUser} = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleUpdateProfile = async () => {
    if (formData?.phoneNumber?.length < 10) {
      setError('Phone number is invalid! Please enter a valid phone number');
      return;
    }
    try {
      setLoading(true);
      const response = await api.put(`/api/users/update-profile`, formData);
      if (response.status === 200) {
        setError('');
        const updatedUser = {
          ...user,
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = () => {
    console.warn('removing the error');
    setError('');
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
    profileContainer: {
      flex: 1,
      flexDirection: 'column',
      padding: 16,
      gap: 16,
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      ...commonStyles.textDefault,
    },
  });
  return (
    <View style={styles.container}>
      <Header
        title="Personal Information"
        showImage={false}
        headerTitleStyle={styles.headerText}
        showBackButton
        onBackPress={handleBackPress}
      />
      <ScrollView
        contentContainerStyle={{paddingBottom: 12}}
        showsVerticalScrollIndicator={false}
        style={styles.container}>
        <View style={styles.profileContainer}>
          <AppInput
            label="Name"
            placeholder="Enter Name"
            value={formData.name}
            onFocus={handleFocus}
            onChangeText={text => setFormData({...formData, name: text})}
          />
          <AppInput
            label="Email"
            placeholder="Enter Email"
            editable={false}
            keyboardType="email-address"
            value={formData.email}
            onFocus={handleFocus}
          />
          <AppInput
            label="Phone Number"
            placeholder="1234567890"
            value={formData.phoneNumber}
            keyboardType="phone-pad"
            variant="phone"
            onFocus={handleFocus}
            onChangeText={text => setFormData({...formData, phoneNumber: text})}
          />
          <Button
            title="Update"
            loading={loading}
            onPress={handleUpdateProfile}
            style={{marginTop: 8}}
          />
          {error && (
            <AppText color={colors.error} style={styles.errorText}>
              {error}
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EditPersonalInformation;
