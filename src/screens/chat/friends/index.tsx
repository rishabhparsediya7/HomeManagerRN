import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthorizeNavigation } from '../../../navigators/navigators';
import { createInitialsForImage } from '../../../utils/users';

const FriendItem = ({ id, image, firstName, lastName, lastMessage, lastMessageTime }: { id: number, image: string, firstName: string, lastName: string, lastMessage: string, lastMessageTime: string }) => {
    const navigation = useAuthorizeNavigation();
    let profileImage = image;
    if (!image) {
        profileImage = createInitialsForImage(firstName + ' ' + lastName);
    }    

    const handleOnFriendRowPress = () => {
        navigation.navigate('FriendChat', { id, firstName, lastName, image, lastMessage, lastMessageTime })
    }

    return (
        <TouchableOpacity onPress={handleOnFriendRowPress} style={styles.subContainer}>
            {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.initialsContainer}><Text style={styles.initials}>{profileImage}</Text></View>}
            <View style={{ flex: 1 }}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{firstName + ' ' + lastName}</Text>
                    {lastMessageTime && <Text style={styles.time}>{new Date(lastMessageTime).toLocaleTimeString().split(':')[0].slice(0, 2).padStart(2, '0') + ':' + new Date(lastMessageTime).toLocaleTimeString().split(':')[1].slice(0, 2).padStart(2, '0')}</Text>}
                </View>
                {lastMessage && <Text style={styles.lastMessage}>{lastMessage}</Text>}
            </View>
        </TouchableOpacity>
    );
};

const LoadingComponent = () => {
    return <View style={styles.container}><Text>Loading...</Text></View>
}

const ListEmptyComponent = () => {
    return <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyText}>No friends found</Text>
    </View>;
}


const FriendsScreen = ({ friends, loading }: { friends: any, loading: boolean }) => {

    if (loading) {
        return <LoadingComponent />
    }
    return (
        <FlatList
            ListHeaderComponent={
                <View>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Chats</Text>
                        <FontAwesome5Icon name="search" size={20} style={styles.searchIcon} />
                    </View>
                </View>
            }
            ListFooterComponent={<View style={{ height: 40 }} />}
            showsVerticalScrollIndicator={false}
            data={friends}
            contentContainerStyle={styles.container}
            renderItem={({ item }) => <FriendItem id={item?.friendId} image={item?.image} firstName={item?.firstName} lastName={item?.lastName} lastMessage={item?.lastMessage} lastMessageTime={item?.lastMessageTime} />}
            ListEmptyComponent={<ListEmptyComponent />}
        />
    );
};
export default FriendsScreen;

const styles = StyleSheet.create({
    container: {
        gap: 24,
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subheaderText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    searchIcon: {
        color: '#333',
        backgroundColor: '#F5F6FA',
        padding: 10,
        borderRadius: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    time: {
        color: '#666',
    },
    lastMessage: {
        color: '#666',
        fontSize: 14,
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
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
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
        backgroundColor: '#F5F6FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});