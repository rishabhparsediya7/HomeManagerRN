import { useTheme } from '../../providers/ThemeContext';
import { darkTheme, lightTheme } from '../../providers/Theme';
import { commonStyles } from '../../utils/styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useMemo } from 'react';

const ActionButton = ({
    label,
    icon,
    onPress,
}: {
    label: string;
    icon: string;
    onPress: () => void;
}) => {
    const { theme } = useTheme();
    const colors = theme === 'dark' ? darkTheme : lightTheme;
    const styles = useMemo(() => StyleSheet.create({
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            marginHorizontal: 20,
        },
        actionLabel: {
            fontSize: 16,
            ...commonStyles.textDefault,
            color: colors.buttonText,
        },
    }), [theme]);
    console.log('Icon: ', icon)
    return (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Icon name={icon} size={32} color={colors.buttonText} />
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

export default ActionButton;