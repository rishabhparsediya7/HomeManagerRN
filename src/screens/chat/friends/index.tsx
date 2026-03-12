import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuthorizeNavigation} from '../../../navigators/navigators';
import {createInitialsForImage} from '../../../utils/users';
import api from '../../../services/api';
import {useEffect, useState} from 'react';
import {useChatStore} from '../../../store';
import {useTheme} from '../../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../../providers/Theme';

import AppText from '@atoms/AppText';
import AppInput from '@molecules/AppInput';
import Button from '@atoms/Button';
import socket from '../../../utils/socket';
import {decryptSingleMessage} from '../services/chatApiService';

const FriendItem = ({
  id,
  image,
  firstName,
  lastName,
  lastMessage,
  lastMessageTime,
  nonce,
  styles,
}: {
  id: string;
  image: string;
  firstName: string;
  lastName: string;
  lastMessage: string;
  lastMessageTime: string;
  nonce: string;
  styles: any;
}) => {
  const navigation = useAuthorizeNavigation();
  const {lastMessages} = useChatStore();
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [lastMessageToDisplay, setLastMessageToDisplay] = useState(
    lastMessages[id],
  );
  let profileImage = image;
  if (!image) {
    profileImage = createInitialsForImage(firstName + ' ' + lastName);
  }

  const handleOnFriendRowPress = () => {
    navigation.navigate('FriendChat', {
      id,
      firstName,
      lastName,
      image,
      lastMessage,
      lastMessageTime,
    });
  };
  // Effect 1: Always decrypt the API's lastMessage — it's the DB source of truth.
  // This handles messages received while the user wasn't on the chat screen.
  useEffect(() => {
    let cancelled = false;

    async function fetchLastMessage() {
      if (!lastMessage || !nonce) return;

      try {
        const decrypted = await decryptSingleMessage(id, lastMessage, nonce);
        if (!cancelled && decrypted) {
          setLastMessageToDisplay(decrypted);
        }
      } catch (err) {
        // Keys may not be ready yet (race with initKeys). Retry once.
        if (!cancelled) {
          setTimeout(async () => {
            try {
              const decrypted = await decryptSingleMessage(
                id,
                lastMessage,
                nonce,
              );
              if (!cancelled && decrypted) {
                setLastMessageToDisplay(decrypted);
              }
            } catch {
              // Still failed — keys truly aren't available
            }
          }, 2000);
        }
      }
    }

    fetchLastMessage();

    return () => {
      cancelled = true;
    };
  }, [lastMessage, nonce]);

  // Effect 2: Sync from store for real-time updates during the current session.
  // When a message is sent/received in the chat, addMessage() updates lastMessages[id].
  useEffect(() => {
    if (lastMessages[id]) {
      setLastMessageToDisplay(lastMessages[id]);
    }
  }, [lastMessages[id]]);

  return (
    <TouchableOpacity
      onPress={handleOnFriendRowPress}
      style={styles.subContainer}>
      {image ? (
        <Image source={{uri: image}} style={styles.image} />
      ) : (
        <View style={styles.initialsContainer}>
          <AppText variant="h6" weight="bold" style={styles.initials}>
            {profileImage}
          </AppText>
        </View>
      )}
      <View style={{flex: 1, gap: 6}}>
        <View style={styles.nameContainer}>
          <AppText variant="h6" weight="semiBold">
            {`${firstName} ${lastName}`}
          </AppText>
          {lastMessageTime && (
            <AppText variant="sm" weight="medium" color={colors.mutedText}>
              {new Date(lastMessageTime)
                .toLocaleTimeString()
                .split(':')[0]
                .slice(0, 2)
                .padStart(2, '0') +
                ':' +
                new Date(lastMessageTime)
                  .toLocaleTimeString()
                  .split(':')[1]
                  .slice(0, 2)
                  .padStart(2, '0')}
            </AppText>
          )}
        </View>
        {lastMessageToDisplay && (
          <AppText variant="lg" numberOfLines={1} color={colors.mutedText}>
            {lastMessageToDisplay}
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const LoadingComponent = ({styles, colors}: {styles: any; colors: any}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="lg" weight="medium" color={colors.mutedText}>
        Loading...
      </AppText>
    </View>
  );
};

const ListEmptyComponent = ({styles, colors}: {styles: any; colors: any}) => {
  return (
    <View style={styles.emptyTextContainer}>
      <AppText variant="lg" weight="medium" color={colors.mutedText}>
        No friends found
      </AppText>
    </View>
  );
};

import SegmentedControl from '@molecules/SegmentedControl';

const FriendsScreen = ({
  friends,
  loading,
  refreshFriends,
}: {
  friends: any;
  loading: boolean;
  refreshFriends: () => void;
}) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [activeTab, setActiveTab] = useState('Chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSplinks, setPendingSplinks] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const fetchPendingSplinks = async () => {
    setLoadingPending(true);
    try {
      const resp = await api.get('/api/chat/splink/pending');
      setPendingSplinks(resp.data || []);
    } catch (error) {
      console.error('Error fetching pending Splinks:', error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleSplinkResponse = async (
    friendId: string,
    action: 'accept' | 'reject',
  ) => {
    setRespondingTo(friendId);
    try {
      await api.post('/api/chat/splink/response', {friendId, action});
      fetchPendingSplinks();
      if (action === 'accept') {
        refreshFriends();
      }
    } catch (error) {
      console.error('Error responding to Splink:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  useEffect(() => {
    fetchPendingSplinks();

    const handleSplinkRequest = (payload: any) => {
      fetchPendingSplinks();
    };

    const handleSplinkResponseListener = (payload: any) => {
      fetchPendingSplinks();
      refreshFriends();
    };

    socket.on('splink_request', handleSplinkRequest);
    socket.on('splink_response', handleSplinkResponseListener);

    return () => {
      socket.off('splink_request', handleSplinkRequest);
      socket.off('splink_response', handleSplinkResponseListener);
    };
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 12,
    },
    emptyText: {
      textAlign: 'center',
    },
    headerSpace: {
      paddingTop: 16,
      paddingBottom: 12,
    },
    sectionLabel: {
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
      marginTop: 16,
    },
    searchInputContainer: {
      marginBottom: 16,
    },
    time: {
      color: colors.mutedText,
    },
    subContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 20,
    },
    image: {
      width: 54,
      height: 54,
      borderRadius: 27,
    },
    nameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    emptyTextContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 80,
    },
    initialsContainer: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initials: {
      color: colors.text,
    },
    pendingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      padding: 14,
      borderRadius: 12,
      marginBottom: 8,
      gap: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: 'white',
    },
    pendingInfo: {
      flex: 1,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    acceptButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
    },
    rejectButton: {
      backgroundColor: colors.error + '15',
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
    },
    buttonText: {
      color: 'white',
    },
  });

  const filteredFriends = searchQuery.trim()
    ? friends.filter((f: any) =>
        (f.firstName + ' ' + f.lastName)
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim()),
      )
    : friends;

  if (loading) {
    return <LoadingComponent styles={styles} colors={colors} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSpace}>
        <SegmentedControl
          options={['Chats', 'Requests']}
          activeOption={activeTab}
          onOptionPress={setActiveTab}
          containerStyle={{marginBottom: 16}}
        />

        {activeTab === 'Chats' && (
          <AppInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for friends"
            leftIcon={
              <Icon name="magnify" size={22} color={colors.mutedText} />
            }
            containerStyle={styles.searchInputContainer}
          />
        )}
      </View>

      {activeTab === 'Chats' ? (
        <FlatList
          data={filteredFriends}
          keyExtractor={item => item.friendId}
          renderItem={({item}) => (
            <FriendItem
              id={item.friendId}
              image={item.image}
              firstName={item.firstName}
              lastName={item.lastName}
              lastMessage={item.lastMessage}
              lastMessageTime={item.lastMessageTime}
              nonce={item.nonce}
              styles={styles}
            />
          )}
          ListEmptyComponent={
            <ListEmptyComponent styles={styles} colors={colors} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}>
          {loadingPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="lg" weight="medium" color={colors.mutedText}>
                Fetching requests...
              </AppText>
            </View>
          ) : pendingSplinks.length > 0 ? (
            <>
              <AppText
                variant="sm"
                weight="semiBold"
                color={colors.mutedText}
                style={styles.sectionLabel}>
                Incoming Requests ({pendingSplinks.length})
              </AppText>
              {pendingSplinks.map(item => (
                <View key={item.friendId} style={styles.pendingItem}>
                  <View style={styles.avatar}>
                    <AppText
                      variant="lg"
                      weight="bold"
                      style={styles.avatarText}>
                      {createInitialsForImage(
                        (item.firstName || '') + ' ' + (item.lastName || ''),
                      )}
                    </AppText>
                  </View>
                  <View style={styles.pendingInfo}>
                    <AppText variant="h6" weight="semiBold">
                      {item.firstName} {item.lastName}
                    </AppText>
                    <AppText variant="sm" color={colors.mutedText}>
                      Sent you a Splink
                    </AppText>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      disabled={respondingTo === item.friendId}
                      onPress={() =>
                        handleSplinkResponse(item.friendId, 'accept')
                      }>
                      {respondingTo === item.friendId ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <AppText
                          variant="sm"
                          weight="semiBold"
                          style={styles.buttonText}>
                          Accept
                        </AppText>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      disabled={respondingTo === item.friendId}
                      onPress={() =>
                        handleSplinkResponse(item.friendId, 'reject')
                      }>
                      <AppText
                        variant="sm"
                        weight="semiBold"
                        style={[styles.buttonText, {color: colors.error}]}>
                        Reject
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyTextContainer}>
              <Icon
                name="clock-outline"
                size={48}
                color={colors.inputBackground}
                style={{marginBottom: 12}}
              />
              <AppText variant="lg" weight="medium" color={colors.mutedText}>
                No pending requests
              </AppText>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default FriendsScreen;
