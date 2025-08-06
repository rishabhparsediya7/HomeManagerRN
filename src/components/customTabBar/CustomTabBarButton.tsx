import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';

// We simplified the props. We only need to know if it's focused and what to do on press.
type Props = {
  children: React.ReactNode;
  onPress: () => void;
  focused: boolean;
};

const CustomTabBarButton = ({ children, onPress, focused }: Props) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // React.useEffect(() => {
  //   Animated.spring(scaleAnim, {
  //     toValue: focused ? 1.2 : 1,
  //     useNativeDriver: true,
  //     friction: 4,
  //   }).start();
  // }, [focused, scaleAnim]);

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.container}>
      <Animated.View
        style={[
          styles.button,
          focused && styles.focused,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5A3FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  focused: {
    backgroundColor: '#7C5DFA',
  },
});

export default CustomTabBarButton;