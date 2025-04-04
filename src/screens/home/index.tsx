import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useAuth} from '../../providers/AuthProvider';

const Home = () => {
  const {signOut} = useAuth();
  return (
    <View>
      <Text>Home</Text>
      <Pressable onPress={() => signOut()}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
