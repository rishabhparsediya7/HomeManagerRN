import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import Header from '../../components/Header';
import {commonStyles} from '../../utils/styles';
import {useAuth} from '../../providers/AuthProvider';
import api from '../../services/api';
import Input from '../../components/form/input';

interface FormData {
  name: string;
  email: string;
  phoneNumber: string;
}

const EditPersonalInformation = ({navigation}: {navigation: any}) => {
  const {theme} = useTheme();
  const {user, setUser} = useAuth();
  const [error, setError]=useState('')
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
  });
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const handleBackPress=()=>{
    if(navigation.canGoBack()){
      navigation.goBack()
    }
  }

  const handleUpdateProfile=async()=>{
    if(formData?.phoneNumber?.length < 10){
      setError('Phone number is invalid! Please enter a valid phone number')
      return;
    }
    try {
      setLoading(true);
      const response = await api.put(`/api/users/update-profile`, formData);
      if(response.status === 200){
        setError('')
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
  }

  const handleFocus=()=>{
    console.warn('removing the error')
    setError('')
  }

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
      flex:1,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 16,
      gap: 16,
    },
    inputGroup: {
      flexDirection: 'column',
      width: '100%',
      gap: 8,
    },
    label: {
      ...commonStyles.textDefault,
      color: colors.inputText,
      fontSize: 16,
    },
    input: {
      flex: 1,
      color: colors.inputText,
      ...commonStyles.textDefault,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBackground,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
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
    errorText:{
      color: colors.error,
      fontSize: 16,
      ...commonStyles.textDefault,
    }
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              placeholder="Enter Name"
              style={styles.input}
              placeholderTextColor={colors.inputText}
              value={formData.name}
              onFocus={handleFocus}
              onChangeText={text => setFormData({...formData, name: text})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter Email"
              style={styles.input}
              editable={false}
              keyboardType="email-address"
              placeholderTextColor={colors.inputText}
              value={formData.email}
              onFocus={handleFocus}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <Input
              placeholder="1234567890"
              style={styles.input}
              placeholderTextColor={colors.mutedText}
              value={formData.phoneNumber}
              keyboardType="phone-pad"
              variant="phone"
              onFocus={handleFocus}
              onChangeText={text => setFormData({...formData, phoneNumber: text})}
            />
          </View>
          <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>
              {loading ? <ActivityIndicator color={colors.buttonText}/>: `Update`}
              </Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
    </View>
  );
};

export default EditPersonalInformation;
