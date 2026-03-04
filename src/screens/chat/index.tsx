import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import FriendsScreen from './friends';
import {View} from 'react-native';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {StyleSheet} from 'react-native';
import Header from '../../components/Header';
import {useFriendsStore} from '../../store';
import {initKeys} from './services/chatKeyService';
import {fetchFriends as fetchFriendsApi} from './services/chatApiService';

const ChatScreen = () => {
  const [loading, setLoading] = useState(false);
  const {friends: cachedFriends, setFriends: setCachedFriends} =
    useFriendsStore();
  const [friends, setFriends] = useState(cachedFriends);

  const fetchFriends = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    // Only show loading spinner if we have no cached data
    if (friends.length === 0) {
      setLoading(true);
    }
    try {
      const data = await fetchFriendsApi(userId);
      setFriends(data);
      setCachedFriends(data); // Persist to local storage
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    initKeys();
  }, []);
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Chat" showDrawerButton={true} />
      <FriendsScreen
        friends={friends}
        loading={loading}
        refreshFriends={fetchFriends}
      />
    </View>
  );
};

export default ChatScreen;
