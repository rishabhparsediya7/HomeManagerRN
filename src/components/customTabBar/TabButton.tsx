import React from 'react';
import { View, StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { useMemo } from 'react';

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
    maxIndex: number;
};

const TabButton = (props: Props) => {
    const { routeName, isFocused, isLeftOfFocused, isRightOfFocused, onPress, index, focusedIndex, maxIndex } = props;
    const iconInfo = routeIcons[routeName]; 
    const { theme } = useTheme();
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    const styles = useMemo(() => StyleSheet.create({
        wrapper: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            backgroundColor: 'transparent',
        },
        container: {
            width: '100%',
            height: 72,
            justifyContent: 'center',
            alignItems: 'center',
            bottom: 4,
            position: 'absolute',
            paddingHorizontal: 20,
        },
        inactiveContainer: { 
            backgroundColor: 'transparent'
        },
        activeGroupContainer: { 
            backgroundColor: colors.tabBarBackground
        },
        focusedPill: { 
            borderTopLeftRadius: 25, 
            borderTopRightRadius: 25, 
            borderBottomLeftRadius: 25, 
            borderBottomRightRadius: 25, 
            borderWidth: 2, 
            borderColor: colors.background ,  
            height: 74,
            width: '90%',
            backgroundColor: colors.tabBarBackground,
        },
        immediateLeftAdjacent: { 
            borderTopRightRadius: 25, 
            borderBottomRightRadius: 25,
            height: 72,
        },
        immediateRightAdjacent: { 
            borderTopLeftRadius: 25, 
            borderBottomLeftRadius: 25,
            height: 72,
        },
        mostLeft: { 
            borderTopLeftRadius: 25, 
            borderBottomLeftRadius: 25,
            height: 72,
        },
        mostRight: { 
            borderTopRightRadius: 25, 
            borderBottomRightRadius: 25,
            height: 72,
        },
    }), [theme]);

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
        if (index === 0) {
            containerStyle.push(styles.mostLeft);
        }
        if (index === maxIndex) {
            containerStyle.push(styles.mostRight);
        }
    }

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity onPress={onPress} style={containerStyle} activeOpacity={0.8}>
                <Icon
                    name={isFocused ? iconInfo.focused : iconInfo.default}
                    size={24}
                    color={isFocused ? colors.tabBarIconActive : colors.tabBarIconInactive}
                />
            </TouchableOpacity>
        </View>
    );
};



export default TabButton;