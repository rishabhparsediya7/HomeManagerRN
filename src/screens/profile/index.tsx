// screens/Profile.js
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Asset} from 'react-native-image-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AccountOption from '../../components/accountOptions';
import ImageUploader from '../../components/imageUploader';
import {useAuth} from '../../providers/AuthProvider';
import api from '../../services/api';
import RupeeIcon from '../../components/rupeeIcon';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal} from '../../components/modal';
import {COLORS} from '../../providers/theme.style';

const Profile = () => {
  const {signOut, user} = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [selectedImage, setSelectedImage] = useState<Asset | undefined>(
    undefined,
  );
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleLogout = () => {
    bottomSheetModalRef.current?.present();
  };

  const getUser = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/users/me');
      console.log(response.data);
      setEmail(response.data.user.email);
      setName(response.data.user.name);
      setProfilePicture(response.data.user.profilePicture);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );

  return (
    <ScrollView
      contentContainerStyle={{paddingBottom: 100}}
      showsVerticalScrollIndicator={false}
      style={styles.container}>
      <View style={styles.header}>
        <ImageUploader
          onImageSelected={image => setSelectedImage(image)}
          selectedImage={selectedImage}
          isProfilePic
          showUploadIcon
          profilePicture={profilePicture}
        />
        <Text style={styles.name}>{user?.name || name}</Text>
        <Text style={styles.email}>{user?.email || email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="wallet" size={24} color="#4F46E5" />
          <Text style={styles.statLabel}>Remaining Budget</Text>
          <RupeeIcon amount={12450} />
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="coins" size={24} color="#4F46E5" />
          <Text style={styles.statLabel}>Monthly Budget</Text>
          <RupeeIcon amount={3000} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account Settings</Text>

      <AccountOption icon="edit" label="Personal Information" />
      <AccountOption icon="credit-card" label="Payment Methods" />
      <AccountOption icon="bell" label="Notifications" />
      <AccountOption icon="shield" label="Security & Privacy" />
      <AccountOption icon="dollar-sign" label="Currency Preferences" />
      <AccountOption icon="download" label="Export Data" />
      <AccountOption icon="log-out" label="Logout" onPress={handleLogout} />
      <Modal
        onCrossPress={() => bottomSheetModalRef.current?.dismiss()}
        headerTitle="Logout"
        variant="scrollableModal"
        bottomSheetRef={bottomSheetModalRef}
        modalSnapPoints={['35%']}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Are you sure you want to logout?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.dismiss()}
              style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={styles.button}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F6F6F6',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
    marginTop: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
    // alignItems: 'center',
    gap: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    // textAlign: 'center',
  },
});

export default Profile;
