import React from 'react';
import { View, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const routeIcons: { [key: string]: { default: string; focused: string } } = {
    Home: { default: 'home-outline', focused: 'home' },
    Expenses: { default: 'list-outline', focused: 'list' },
    Chat: { default: 'chatbubble-ellipses-outline', focused: 'chatbubble-ellipses' },
    Profile: { default: 'person-outline', focused: 'person' },
    Add: { default: 'add', focused: 'add' },
};

type Props = {
    routeName: string;
    isFocused: boolean;
    isLeftOfFocused: boolean;
    isRightOfFocused: boolean;
    onPress: () => void;
    index: number;
    focusedIndex: number;
};

const TabButton = (props: Props) => {
    const { routeName, isFocused, isLeftOfFocused, isRightOfFocused, onPress, index, focusedIndex } = props;
    const iconInfo = routeIcons[routeName];

    const containerStyle: StyleProp<ViewStyle> = [
        styles.container,
        (isFocused || isLeftOfFocused || isRightOfFocused)
            ? styles.activeGroupContainer
            : styles.inactiveContainer,
    ];

    if (isFocused) {
        containerStyle.push(styles.focusedPill);
    } else {
        if (index === focusedIndex - 1) {
            containerStyle.push(styles.immediateLeftAdjacent);
        }
        if (index === focusedIndex + 1) {
            containerStyle.push(styles.immediateRightAdjacent);
        }
    }

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={onPress} style={containerStyle} activeOpacity={0.8}>
                <Icon
                    name={isFocused ? iconInfo.focused : iconInfo.default}
                    size={24}
                    color={isFocused ? '#FFFFFF' : '#C7BFFC'}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'transparent' },
    addButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF6347', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 10, right: 10 },
    container: { width: '100%', height: 65, justifyContent: 'center', alignItems: 'center', },
    inactiveContainer: { backgroundColor: 'transparent' },
    activeGroupContainer: { backgroundColor: '#5A3FFF' },
    focusedPill: { borderTopLeftRadius: 25, borderTopRightRadius: 25, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, borderWidth: 2, borderColor: 'white' },
    immediateLeftAdjacent: { borderTopRightRadius: 25, borderBottomRightRadius: 25 },
    immediateRightAdjacent: { borderTopLeftRadius: 25, borderBottomLeftRadius: 25 },
});

export default TabButton;