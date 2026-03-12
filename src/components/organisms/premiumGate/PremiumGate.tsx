import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppTheme} from '../../../providers/Theme';

interface PremiumGateProps {
  isPremium: boolean;
  colors: AppTheme;
  children: React.ReactNode;
  featureName?: string;
  onUpgradePress?: () => void;
}

/**
 * Wraps premium-only content. If the user is not premium,
 * shows a locked state with an upgrade prompt instead.
 */
const PremiumGate: React.FC<PremiumGateProps> = ({
  isPremium,
  colors,
  children,
  featureName = 'This feature',
  onUpgradePress,
}) => {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <View style={styles.lockedContent}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: colors.primary + '15'},
          ]}>
          <Icon name="lock" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, {color: colors.text}]}>{featureName}</Text>
        <Text style={[styles.subtitle, {color: colors.mutedText}]}>
          Upgrade to Premium to unlock this feature
        </Text>
        {onUpgradePress && (
          <TouchableOpacity
            style={[styles.upgradeButton, {backgroundColor: colors.primary}]}
            onPress={onUpgradePress}
            activeOpacity={0.8}>
            <Icon name="crown" size={16} color="#FFFFFF" />
            <Text style={styles.upgradeText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  lockedContent: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PremiumGate;
