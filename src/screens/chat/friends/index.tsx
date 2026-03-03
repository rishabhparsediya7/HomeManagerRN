import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuthorizeNavigation} from '../../../navigators/navigators';
import {createInitialsForImage} from '../../../utils/users';
import {getStoredKeyPair} from '../../../utils/cryptoUtils';
import naclUtil from 'tweetnacl-util';
import nacl from 'tweetnacl';
import api from '../../../services/api';
import {useEffect, useState} from 'react';
import {useChatStore} from '../../../store';
import {useTheme} from '../../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../../providers/Theme';
import {commonStyles} from '../../../utils/styles';
import AppText from '../../../components/common/AppText';
import AppInput from '../../../components/common/AppInput';
import Button from '../../../components/Button';
import socket from '../../../utils/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleReceiveMessage = async (payload: {
  senderId: string;
  message: string;
  nonce: string;
}) => {
  const pair = await getStoredKeyPair();
  let mySK = pair?.secretKey;

  // Fallback: initKeys() stores keys in AsyncStorage, not Keychain.
  // On reinstall, Keychain is empty but AsyncStorage has the keys.
  if (!mySK) {
    const storedKey = await AsyncStorage.getItem('privateKey');
    if (storedKey) {
      mySK = naclUtil.decodeBase64(storedKey);
    }
  }

  if (!mySK) {
    throw new Error('Keypair not found');
  }

  const resp = await api.get(`/api/chat/get-user-keys/${payload.senderId}`);
  const {publicKey: theirPubB64} = resp.data;
  const theirPub = naclUtil.decodeBase64(theirPubB64);

  const decrypted = nacl.box.open(
    naclUtil.decodeBase64(payload.message),
    naclUtil.decodeBase64(payload.nonce),
    theirPub,
    mySK,
  );

  if (decrypted) {
    const plaintext = naclUtil.encodeUTF8(decrypted);
    return plaintext;
  } else {
    console.warn('❌ Could not decrypt message');
    return null;
  }
};
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
  useEffect(() => {
    let cancelled = false;

    async function fetchLastMessage() {
      // Skip if there's no encrypted message from the API
      if (!lastMessage || !nonce) return;

      try {
        const decrypted = await handleReceiveMessage({
          senderId: id,
          message: lastMessage,
          nonce: nonce,
        });
        if (!cancelled && decrypted) {
          setLastMessageToDisplay(decrypted);
        }
      } catch (err) {
        // Keys may not be ready yet (race with initKeys).
        // Retry once after a short delay.
        if (!cancelled) {
          setTimeout(async () => {
            try {
              const decrypted = await handleReceiveMessage({
                senderId: id,
                message: lastMessage,
                nonce: nonce,
              });
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

    if (!lastMessages[id]) {
      fetchLastMessage();
    }

    return () => {
      cancelled = true;
    };
  }, [lastMessages[id]]);

  return (
    <TouchableOpacity
      onPress={handleOnFriendRowPress}
      style={styles.subContainer}>
      {image ? (
        <Image source={{uri: image}} style={styles.image} />
      ) : (
        <View style={styles.initialsContainer}>
          <AppText weight="semiBold" style={styles.initials}>
            {profileImage}
          </AppText>
        </View>
      )}
      <View style={{flex: 1, gap: 6}}>
        <View style={styles.nameContainer}>
          <AppText
            variant="h6"
            weight="semiBold">{`${firstName} ${lastName}`}</AppText>
          {lastMessageTime && (
            <AppText variant="sm" style={styles.time}>
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
          <AppText variant="md" numberOfLines={1}>
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
      <AppText style={styles.loadingText}>Loading...</AppText>
    </View>
  );
};

const ListEmptyComponent = ({styles}: {styles: any}) => {
  return (
    <View style={styles.emptyTextContainer}>
      <AppText style={styles.emptyText}>No friends found</AppText>
    </View>
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingSplinks, setPendingSplinks] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

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
    try {
      await api.post('/api/chat/splink/response', {friendId, action});
      fetchPendingSplinks();
      if (action === 'accept') {
        refreshFriends();
      }
    } catch (error) {
      console.error('Error responding to Splink:', error);
    }
  };

  useEffect(() => {
    fetchPendingSplinks();

    const handleSplinkRequest = (payload: any) => {
      console.log('📨 New Splink request received:', payload);
      fetchPendingSplinks();
    };

    const handleSplinkResponse = (payload: any) => {
      console.log('📨 Splink response received:', payload);
      fetchPendingSplinks();
      refreshFriends();
    };

    socket.on('splink_request', handleSplinkRequest);
    socket.on('splink_response', handleSplinkResponse);

    return () => {
      socket.off('splink_request', handleSplinkRequest);
      socket.off('splink_response', handleSplinkResponse);
    };
  }, []);

  const styles = StyleSheet.create({
    container: {
      gap: 24,
      padding: 20,
      backgroundColor: colors.background,
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      ...commonStyles.textDefault,
      color: colors.inputText,
    },
    emptyText: {
      fontSize: 18,
      ...commonStyles.textDefault,
      color: colors.inputText,
    },
    header: {
      flexDirection: 'row',
    },
    headerText: {
      fontSize: 28,
      ...commonStyles.textDefault,
      color: colors.text,
    },
    subheaderText: {
      fontSize: 24,
      ...commonStyles.textDefault,
      color: colors.text,
    },
    searchIcon: {
      position: 'absolute',
      left: 0,
      top: 6,
      color: colors.buttonText,
      padding: 10,
      borderRadius: 10,
      zIndex: 1,
      ...commonStyles.textDefault,
    },
    searchInput: {
      flex: 1,
      height: 52,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 10,
      color: colors.inputText,
      fontSize: 18,
      ...commonStyles.textDefault,
      paddingLeft: 40,
    },
    time: {
      ...commonStyles.textDefault,
      color: colors.text,
    },
    subContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 30,
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
    },
    initialsContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initials: {
      fontSize: 20,
      ...commonStyles.textDefault,
      color: colors.text,
    },
    pendingSection: {
      marginBottom: 20,
    },
    pendingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      gap: 12,
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
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    rejectButton: {
      backgroundColor: colors.receiverBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    buttonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  if (loading) {
    return <LoadingComponent styles={styles} colors={colors} />;
  }
  return (
    <FlatList
      ListHeaderComponent={
        <View style={{marginBottom: 40}}>
          <AppInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for friends"
            leftIcon={
              <FontAwesome5Icon name="search" size={18} color={colors.text} />
            }
            containerStyle={{flex: 1}}
          />

          {pendingSplinks.length > 0 && (
            <View style={styles.pendingSection}>
              <AppText weight="bold" style={{marginTop: 20}}>
                Pending Splinks
              </AppText>
              {pendingSplinks.map(item => (
                <View key={item.friendId} style={styles.pendingItem}>
                  <Icon name="user-circle" size={40} color={colors.mutedText} />
                  <View style={styles.pendingInfo}>
                    <AppText variant="h3" weight="semiBold">
                      {`${item.firstName} ${item.lastName}`}
                    </AppText>
                  </View>
                  <View style={styles.actionButtons}>
                    <Button
                      title="Accept"
                      onPress={() =>
                        handleSplinkResponse(item.friendId, 'accept')
                      }
                      style={{paddingVertical: 8, paddingHorizontal: 12}}
                      textStyle={{fontSize: 13}}
                    />
                    <Button
                      title="Reject"
                      variant="outline"
                      onPress={() =>
                        handleSplinkResponse(item.friendId, 'reject')
                      }
                      style={{paddingVertical: 8, paddingHorizontal: 12}}
                      textStyle={{fontSize: 13}}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      }
      ListFooterComponent={<View style={{height: 40}} />}
      showsVerticalScrollIndicator={false}
      data={friends}
      contentContainerStyle={styles.container}
      renderItem={({item}) => (
        <FriendItem
          id={item?.friendId}
          image={item?.image}
          firstName={item?.firstName}
          lastName={item?.lastName}
          lastMessage={item?.lastMessage}
          lastMessageTime={item?.lastMessageTime}
          nonce={item?.nonce}
          styles={styles}
        />
      )}
      ListEmptyComponent={<ListEmptyComponent styles={styles} />}
    />
  );
};
export default FriendsScreen;
