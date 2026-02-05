import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
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
import Input from '../../../components/form/input';
import socket from '../../../utils/socket';
const handleReceiveMessage = async (payload: {
  senderId: string;
  message: string;
  nonce: string;
}) => {
  const pair = await getStoredKeyPair();
  if (!pair) throw new Error('Keypair not found');
  const {secretKey: mySK} = pair;

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
    async function fetchLastMessage() {
      const lastMessageToDisplay = await handleReceiveMessage({
        senderId: id,
        message: lastMessage,
        nonce: nonce,
      });
      if (!lastMessageToDisplay) return;
      setLastMessageToDisplay(lastMessageToDisplay);
    }
    if (!lastMessages[id]) {
      fetchLastMessage();
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
          <Text style={styles.initials}>{profileImage}</Text>
        </View>
      )}
      <View style={{flex: 1}}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{firstName + ' ' + lastName}</Text>
          {lastMessageTime && (
            <Text style={styles.time}>
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
            </Text>
          )}
        </View>
        {lastMessageToDisplay && (
          <Text numberOfLines={1} style={styles.lastMessage}>
            {lastMessageToDisplay}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const LoadingComponent = ({styles}: {styles: any}) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={styles.loadingText} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const ListEmptyComponent = ({styles}: {styles: any}) => {
  return (
    <View style={styles.emptyTextContainer}>
      <Text style={styles.emptyText}>No friends found</Text>
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
    name: {
      fontSize: 18,
      ...commonStyles.textDefault,
      color: colors.text,
    },
    time: {
      ...commonStyles.textDefault,
      color: colors.text,
    },
    lastMessage: {
      ...commonStyles.textDefault,
      color: colors.text,
    },
    subContainer: {
      flexDirection: 'row',
      alignItems: 'center',
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
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      ...commonStyles.textDefault,
    },
  });

  if (loading) {
    return <LoadingComponent styles={styles} />;
  }
  return (
    <FlatList
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <FontAwesome5Icon
              name="search"
              size={18}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.inputText}
              placeholder="Search for friends"
            />
          </View>

          {pendingSplinks.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={styles.sectionTitle}>Pending Splinks</Text>
              {pendingSplinks.map(item => (
                <View key={item.friendId} style={styles.pendingItem}>
                  <Icon name="user-circle" size={40} color={colors.mutedText} />
                  <View style={styles.pendingInfo}>
                    <Text style={styles.name}>
                      {item.firstName} {item.lastName}
                    </Text>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() =>
                        handleSplinkResponse(item.friendId, 'accept')
                      }>
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() =>
                        handleSplinkResponse(item.friendId, 'reject')
                      }>
                      <Text style={[styles.buttonText, {color: colors.text}]}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {friends.length > 0 && (
            <Text style={[styles.sectionTitle, {marginTop: 20}]}>
              Your Friends
            </Text>
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
