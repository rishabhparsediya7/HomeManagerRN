// screens/Profile.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AccountOption from '../../components/accountOptions';

const Profile = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{uri: 'https://i.pravatar.cc/150?img=12'}}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons
            name="create-outline"
            style={{alignSelf: 'center'}}
            color="white"
            size={20}
          />
        </TouchableOpacity>
        <Text style={styles.name}>John Smith</Text>
        <Text style={styles.email}>john.smith@email.com</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Ionicons name="wallet" size={24} color="#4F46E5" />
          <Text style={styles.statLabel}>Total Savings</Text>
          <Text style={styles.statValue}>$12,450</Text>
        </View>
        <View style={styles.statBox}>
          <FontAwesome5 name="coins" size={24} color="#4F46E5" />
          <Text style={styles.statLabel}>Monthly Budget</Text>
          <Text style={styles.statValue}>$3,000</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Account Settings</Text>

      <AccountOption icon="edit" label="Personal Information" />
      <AccountOption icon="credit-card" label="Payment Methods" />
      <AccountOption icon="bell" label="Notifications" />
      <AccountOption icon="shield" label="Security & Privacy" />
      <AccountOption icon="dollar-sign" label="Currency Preferences" />
      <AccountOption icon="download" label="Export Data" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F6F6F6',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editIcon: {
    position: 'absolute',
    right: 160,
    bottom: 75,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 6,
    paddingLeft: 8,
    paddingBottom: 8,
    zIndex: 10,
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
  },
  statBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '42%',
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
});

export default Profile;
