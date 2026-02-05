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
}: {
  friends: any;
  loading: boolean;
}) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const [searchQuery, setSearchQuery] = useState('');

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
  });

  if (loading) {
    return <LoadingComponent styles={styles} />;
  }
  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.header}>
          <FontAwesome5Icon name="search" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.inputText}
            placeholder="Search for friends"
          />
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
