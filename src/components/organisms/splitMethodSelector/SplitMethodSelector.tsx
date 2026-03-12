import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppTheme} from '../../../providers/Theme';
import {
  SplitMode,
  SplitResult,
  Participant,
} from '../../../hooks/useSplitCalculator';
import SegmentedControl from '@molecules/SegmentedControl';
import AppText from '@atoms/AppText';
import RupeeIcon from '@atoms/rupeeIcon';

interface SplitMethodSelectorProps {
  colors: AppTheme;
  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;
  splitResults: SplitResult[];
  validation: {
    isValid: boolean;
    message: string;
    splitTotal: number;
    diff: number;
  };
  totalAmount: number;
  participants: Participant[];
  // Unequal mode
  customAmounts: Record<string, number>;
  setCustomAmount: (userId: string, amount: number) => void;
  // Percentage mode
  percentages: Record<string, number>;
  setPercentage: (userId: string, pct: number) => void;
  // Share mode
  shares: Record<string, number>;
  setShare: (userId: string, shareCount: number) => void;
}

const SPLIT_MODES: {key: SplitMode; label: string; icon: string}[] = [
  {key: 'equal', label: 'Equal', icon: 'equal'},
  {key: 'unequal', label: 'Unequal', icon: 'not-equal-variant'},
  {key: 'percentage', label: 'Percent', icon: 'percent-outline'},
  {key: 'share', label: 'Shares', icon: 'chart-pie'},
];

const SplitMethodSelector: React.FC<SplitMethodSelectorProps> = ({
  colors,
  splitMode,
  setSplitMode,
  splitResults,
  validation,
  totalAmount,
  participants,
  customAmounts,
  setCustomAmount,
  percentages,
  setPercentage,
  shares,
  setShare,
}) => {
  if (participants.length === 0) return null;

  const modeOptions = SPLIT_MODES.map(m => m.label);
  const activeOption =
    SPLIT_MODES.find(m => m.key === splitMode)?.label || 'Equal';

  const handleOptionPress = (label: string) => {
    const mode = SPLIT_MODES.find(m => m.label === label)?.key;
    if (mode) setSplitMode(mode);
  };

  return (
    <View style={styles.container}>
      {/* Mode Tabs - Using SegmentedControl */}
      <SegmentedControl
        options={modeOptions}
        activeOption={activeOption}
        onOptionPress={handleOptionPress}
      />

      {/* Split Details */}
      <View
        style={[
          styles.splitDetails,
          {backgroundColor: colors.surface, borderColor: colors.border},
        ]}>
        {splitMode === 'equal' && (
          <View style={styles.equalInfo}>
            <Icon name="check-circle" size={24} color={colors.success} />
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <RupeeIcon
                amount={
                  participants.length > 0
                    ? totalAmount / participants.length
                    : 0
                }
                size={18}
                color={colors.text}
                textStyle={{fontWeight: '600'}}
              />
              <AppText variant="md" style={{color: colors.mutedText}}>
                per person
              </AppText>
            </View>
          </View>
        )}

        {splitMode === 'unequal' && (
          <View style={styles.participantList}>
            {splitResults.map(result => (
              <View key={result.userId} style={styles.participantRow}>
                <AppText
                  variant="md"
                  weight="medium"
                  style={{color: colors.text, flex: 1}}
                  numberOfLines={1}>
                  {result.name}
                </AppText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                    },
                  ]}>
                  <AppText style={{color: colors.mutedText, marginRight: 4}}>
                    ₹
                  </AppText>
                  <TextInput
                    style={[styles.amountInput, {color: colors.inputText}]}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.placeholder}
                    value={
                      customAmounts[result.userId]
                        ? String(customAmounts[result.userId])
                        : ''
                    }
                    onChangeText={text =>
                      setCustomAmount(result.userId, parseFloat(text) || 0)
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {splitMode === 'percentage' && (
          <View style={styles.participantList}>
            {splitResults.map(result => (
              <View key={result.userId} style={styles.participantRow}>
                <View style={styles.nameAndAmount}>
                  <AppText
                    variant="md"
                    weight="medium"
                    style={{color: colors.text}}
                    numberOfLines={1}>
                    {result.name}
                  </AppText>
                  <RupeeIcon
                    amount={result.amountOwed}
                    size={13}
                    color={colors.mutedText}
                  />
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.inputBorder,
                      width: 90,
                    },
                  ]}>
                  <TextInput
                    style={[styles.percentInput, {color: colors.inputText}]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    value={
                      percentages[result.userId] !== undefined
                        ? String(percentages[result.userId])
                        : ''
                    }
                    onChangeText={text =>
                      setPercentage(result.userId, parseFloat(text) || 0)
                    }
                  />
                  <AppText style={{color: colors.mutedText, marginLeft: 2}}>
                    %
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}

        {splitMode === 'share' && (
          <View style={styles.participantList}>
            {splitResults.map(result => (
              <View key={result.userId} style={styles.participantRow}>
                <View style={styles.nameAndAmount}>
                  <AppText
                    variant="md"
                    weight="bold"
                    style={{color: colors.text}}
                    numberOfLines={1}>
                    {result.name}
                  </AppText>
                  <RupeeIcon
                    amount={result.amountOwed}
                    size={15}
                    color={colors.mutedText}
                  />
                </View>
                <View style={styles.shareControls}>
                  <TouchableOpacity
                    style={[
                      styles.shareBtn,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      setShare(
                        result.userId,
                        Math.max(0, (shares[result.userId] || 0) - 1),
                      )
                    }>
                    <Icon name="minus" size={20} color={colors.text} />
                  </TouchableOpacity>
                  <AppText
                    variant="md"
                    weight="bold"
                    style={[styles.shareCount, {color: colors.text}]}>
                    {shares[result.userId] || 0}
                  </AppText>
                  <TouchableOpacity
                    style={[
                      styles.shareBtn,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      setShare(result.userId, (shares[result.userId] || 0) + 1)
                    }>
                    <Icon name="plus" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Validation Message */}
        {validation.message !== '' && (
          <View
            style={[
              styles.validationBar,
              {
                backgroundColor: validation.isValid
                  ? colors.success + '15'
                  : colors.error + '15',
              },
            ]}>
            <Icon
              name={validation.isValid ? 'check-circle' : 'alert-circle'}
              size={20}
              color={validation.isValid ? colors.success : colors.error}
            />
            <AppText
              variant="sm"
              weight="semiBold"
              style={{
                color: validation.isValid ? colors.success : colors.error,
                flex: 1,
              }}>
              {validation.message}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 20,
  },
  splitDetails: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  equalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  participantList: {
    gap: 20,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameAndAmount: {
    flex: 1,
    gap: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    width: 120,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  percentInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  shareControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCount: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 18,
  },
  validationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 20,
  },
});

export default SplitMethodSelector;
