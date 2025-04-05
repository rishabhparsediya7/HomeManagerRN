import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useAuth} from '../../providers/AuthProvider';
import Calendar from '../../components/calendar';

const Home = () => {
  const {signOut} = useAuth();
  const [date, setDate] = useState(new Date());
  console.log('🚀 ~ Home ~ date:', date);
  return (
    <View>
      <Text>Home</Text>
      <Pressable onPress={() => signOut()}>
        <Text>Sign Out</Text>
      </Pressable>
      <Calendar setDate={setDate} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
