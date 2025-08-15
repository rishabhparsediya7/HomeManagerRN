import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';

interface Option {
  id: string;
  name: string;
  icon?: any;
}

const OPTIONS: Option[] = [
  {
    id: '1',
    name: 'Option 1',
    icon: null,
  },
  {
    id: '2',
    name: 'Option 2',
    icon: null,
  },
  {
    id: '3',
    name: 'Option 3',
    icon: null,
  },
  {
    id: '4',
    name: 'Option 4',
    icon: null,
  },
];

export default function SlideDropdown({
  title = 'Select an option',
  options = OPTIONS,
  handleSelectCategory,
  handleSelectPaymentMethod,
  reset,
}: {
  title: string;
  options: Option[];
  handleSelectCategory?: (category: string) => void;
  handleSelectPaymentMethod?: (paymentMethod: string) => void;
  reset?: boolean;
}) {
  const [selected, setSelected] = useState(title);
  const [isAnyOptionSelected, setIsAnyOptionSelected] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({x: 0, y: 0, width: 0, height: 0});
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const buttonRef = useRef<View>(null);

  const openDropdown = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const newCoords = {x, y: y + 8, width, height};
      console.log(newCoords);
      setCoords(newCoords);
      setVisible(true);

      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  };

  const closeDropdown = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleSelect = (item: Option) => {
    setSelected(item.name);
    setIsAnyOptionSelected(true);
    closeDropdown();
    if (handleSelectCategory) {
      handleSelectCategory(item.id);
    }
    if (handleSelectPaymentMethod) {
      handleSelectPaymentMethod(item.id);
    }
  };

  useEffect(() => {
    if(reset){
      setSelected(title);
      setIsAnyOptionSelected(false);
      closeDropdown();
    }
  }, [reset]);

  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownButton: {
      paddingHorizontal: 14,
      borderRadius: 20,
      minWidth: 130,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    dropdownList: {
      position: 'absolute',
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      elevation: 5,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: {width: 0, height: 2},
      maxHeight: 200,
    },
    option: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedButton: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    text: {
      color: colors.buttonText,
      ...commonStyles.textDefault,
      textAlign: 'center',
      minWidth: 130,
    },
  });

  return (
    <LinearGradient
      start={{x: 1, y: 0}}
      end={{x: 0, y: 1}}
      colors={[
        colors.inputBackground,
        isAnyOptionSelected ? colors.inputText : colors.inputBackground,
      ]}
      style={[styles.dropdownButton, selected && styles.selectedButton]}>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.dropdownButton}
        onPress={openDropdown}>
        <Text style={styles.text}>{selected}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={closeDropdown}
          activeOpacity={1}>
          <Animated.View
            style={[
              styles.dropdownList,
              {
                top: coords.y + coords.height,
                left: coords.x,
                width: coords.width,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}>
            <FlatList
              data={options}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item)}>
                  <Text style={styles.text}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}
