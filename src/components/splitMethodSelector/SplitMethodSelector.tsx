import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppTheme} from '../../providers/Theme';
import {
  SplitMode,
  SplitResult,
  Participant,
} from '../../hooks/useSplitCalculator';

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

  return (
    <View style={styles.container}>
      {/* Mode Tabs */}
      <View
        style={[
          styles.tabContainer,
          {backgroundColor: colors.inputBackground},
        ]}>
        {SPLIT_MODES.map(mode => {
          const isActive = splitMode === mode.key;
          return (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.tab,
                isActive && {backgroundColor: colors.primary},
              ]}
              onPress={() => setSplitMode(mode.key)}
              activeOpacity={0.7}>
              <Icon
                name={mode.icon}
                size={16}
                color={isActive ? '#FFFFFF' : colors.mutedText}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {color: isActive ? '#FFFFFF' : colors.mutedText},
                ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Split Details */}
      <View style={[styles.splitDetails, {borderColor: colors.border}]}>
        {splitMode === 'equal' && (
          <View style={styles.equalInfo}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <Text style={[styles.equalText, {color: colors.text}]}>
              ₹
              {participants.length > 0
                ? (totalAmount / participants.length).toFixed(2)
                : '0.00'}{' '}
              per person
            </Text>
          </View>
        )}

        {splitMode === 'unequal' && (
          <View style={styles.participantList}>
            {splitResults.map(result => (
              <View key={result.userId} style={styles.participantRow}>
                <Text
                  style={[styles.participantName, {color: colors.text}]}
                  numberOfLines={1}>
                  {result.name}
                </Text>
                <View style={styles.inputRow}>
                  <Text
                    style={[styles.currencySymbol, {color: colors.mutedText}]}>
                    ₹
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      {
                        color: colors.inputText,
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
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
                  <Text
                    style={[styles.participantName, {color: colors.text}]}
                    numberOfLines={1}>
                    {result.name}
                  </Text>
                  <Text
                    style={[
                      styles.calculatedAmount,
                      {color: colors.mutedText},
                    ]}>
                    ₹{result.amountOwed.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.percentInput,
                      {
                        color: colors.inputText,
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.inputBorder,
                      },
                    ]}
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
                  <Text style={[styles.percentSign, {color: colors.mutedText}]}>
                    %
                  </Text>
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
                  <Text
                    style={[styles.participantName, {color: colors.text}]}
                    numberOfLines={1}>
                    {result.name}
                  </Text>
                  <Text
                    style={[
                      styles.calculatedAmount,
                      {color: colors.mutedText},
                    ]}>
                    ₹{result.amountOwed.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.shareControls}>
                  <TouchableOpacity
                    style={[styles.shareBtn, {borderColor: colors.border}]}
                    onPress={() =>
                      setShare(
                        result.userId,
                        Math.max(0, (shares[result.userId] || 1) - 1),
                      )
                    }>
                    <Icon name="minus" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.shareCount, {color: colors.text}]}>
                    {shares[result.userId] || 0}
                  </Text>
                  <TouchableOpacity
                    style={[styles.shareBtn, {borderColor: colors.border}]}
                    onPress={() =>
                      setShare(result.userId, (shares[result.userId] || 1) + 1)
                    }>
                    <Icon name="plus" size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

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
            size={16}
            color={validation.isValid ? colors.success : colors.error}
          />
          <Text
            style={[
              styles.validationText,
              {color: validation.isValid ? colors.success : colors.error},
            ]}>
            {validation.message}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  splitDetails: {
    marginTop: 12,
    borderTopWidth: 0,
  },
  equalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  equalText: {
    fontSize: 15,
    fontWeight: '500',
  },
  participantList: {
    gap: 10,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    maxWidth: '50%',
  },
  nameAndAmount: {
    flex: 1,
    gap: 2,
  },
  calculatedAmount: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountInput: {
    width: 100,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    textAlign: 'right',
  },
  percentInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    textAlign: 'right',
  },
  percentSign: {
    fontSize: 14,
    fontWeight: '500',
  },
  shareControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareCount: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  validationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  validationText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default SplitMethodSelector;
