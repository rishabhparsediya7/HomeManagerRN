import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { commonStyles } from '../../utils/styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionProps {
  title: string;
  icon: string;
  options: string[];
  onOptionPress?: (option: string) => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon, options, onOptionPress }) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      width: '100%',
    },
    header: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      alignItems: 'center',
    },
    iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    title: {
      fontSize: 16,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
    body: {
      paddingVertical: 8,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderTopColor: colors.inputBorder,
      width: '85%',
      marginLeft: 35,
    },
    optionText: {
      fontSize: 14,
      ...commonStyles.textDefault,
      color: colors.buttonText,
    },
  });
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.8}>
        <View style={styles.iconContainer}> 
        {icon === 'dark-mode' ? <MaterialIcons name={theme === 'dark' ? 'dark-mode' : 'light-mode'} size={20} color={colors.buttonText} /> : <Feather name={icon} size={20} color={colors.buttonText} />}
        <Text style={styles.title}>{title}</Text>
        </View>
        <Icon
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={colors.buttonText}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => onOptionPress?.(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};


export default Accordion;
