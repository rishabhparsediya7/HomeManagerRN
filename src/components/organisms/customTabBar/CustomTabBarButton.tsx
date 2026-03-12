import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';

type Props = {
  children: React.ReactNode;
  onPress: () => void;
  focused: boolean;
  isElevated?: boolean; 
};


// TODO: Remove this comment if you are using this.
// Not usable as of now

const CustomTabBarButton = ({ children, onPress, focused, isElevated = false }: Props) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  }, [focused, scaleAnim, isElevated]);

  const containerStyle = isElevated ? styles.elevatedContainer : styles.container;
  const buttonStyle = isElevated ? styles.elevatedButton : styles.button;

  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} style={containerStyle}>
      <Animated.View
        style={[
          buttonStyle,
          focused && !isElevated && styles.focused,
          focused && isElevated && styles.elevatedFocused,
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
  },
  focused: {
    backgroundColor: '#7C5DFA',
  },
  
  elevatedContainer: {
    position: 'absolute',
    top: -35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderRadius: 25,
    backgroundColor: 'white',
    borderColor: 'white',
  },
  elevatedButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  elevatedFocused: {
    backgroundColor: '#FF4500',
  },
});

export default CustomTabBarButton;