import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomTabBarButton from './CustomTabBarButton';

const routeIcons: { [key: string]: string } = {
    Home: 'home-outline',
    Expenses: 'list-outline',
    Add: 'add-outline',
    Chat: 'chatbubble-ellipses-outline',
    Profile: 'person-outline',
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    return (
        <View style={styles.tabBarContainer}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <CustomTabBarButton
                        key={route.key}
                        onPress={onPress}
                        focused={isFocused}
                    >
                        <Icon
                            name={routeIcons[route.name] || 'ellipse-outline'}
                            color={isFocused ? '#FFFFFF' : '#E5E7EB'}
                            size={24}
                        />
                    </CustomTabBarButton>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        height: 80,
        backgroundColor: 'black',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
});

export default CustomTabBar;