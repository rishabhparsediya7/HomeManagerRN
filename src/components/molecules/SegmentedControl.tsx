import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import AppText from '@atoms/AppText';

interface SegmentedControlProps {
  options: string[];
  activeOption: string;
  onOptionPress: (option: string) => void;
  containerStyle?: any;
}

const SegmentedControl = ({
  options,
  activeOption,
  onOptionPress,
  containerStyle,
}: SegmentedControlProps) => {
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const activeIndex = options.indexOf(activeOption);
  const segmentWidth = (Dimensions.get('window').width - 40) / options.length;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * segmentWidth,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [activeIndex, segmentWidth, slideAnim]);

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      padding: 4,
      position: 'relative',
      height: 46,
      alignItems: 'center',
    },
    activeIndicator: {
      position: 'absolute',
      top: 4,
      left: 4,
      height: 38,
      width: segmentWidth - 4,
      backgroundColor: colors.background,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    option: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    optionText: {
      fontSize: 13,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [{translateX: slideAnim}],
            width: segmentWidth - 4,
          },
        ]}
      />
      {options.map(option => (
        <TouchableOpacity
          key={option}
          activeOpacity={0.8}
          style={styles.option}
          onPress={() => onOptionPress(option)}>
          <AppText
            style={[
              styles.optionText,
              {
                color:
                  activeOption === option ? colors.primary : colors.mutedText,
              },
            ]}>
            {option}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SegmentedControl;
