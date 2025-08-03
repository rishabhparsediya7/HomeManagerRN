import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthorizeNavigation } from '../../../navigators/navigators';
import { friends } from '../../../constants';

const FriendItem = ({ id, image, name, lastMessage, timestamp }: { id: number, image: string, name: string, lastMessage: string, timestamp: string }) => {
    const navigation = useAuthorizeNavigation();
    return (
        <TouchableOpacity onPress={() => { navigation.navigate('FriendChat', { id, name, image, lastMessage, timestamp }) }} style={styles.subContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={{ flex: 1 }}>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.time}>{new Date(timestamp).toLocaleTimeString().split(':')[0].slice(0, 2) + ':' + new Date(timestamp).toLocaleTimeString().split(':')[1].slice(0, 2)}</Text>
                </View>
                <Text style={styles.lastMessage}>{lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );
};

const FriendsScreen = () => {
   
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
            renderItem={({ item }) => <FriendItem id={item.id} image={item.image} name={item.name} lastMessage={item.lastMessage} timestamp={item.timestamp} />}
        />
    );
};
export default FriendsScreen;

const styles = StyleSheet.create({
    container: {
        gap: 24,
        padding: 20,
        backgroundColor: '#fff',
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
});