import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/Header';
import {useTheme} from '../../providers/ThemeContext';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {commonStyles} from '../../utils/styles';
import splitExpenseApi, {SplitExpense} from '../../services/splitExpenseApi';
import RupeeIcon from '../../components/rupeeIcon';
import {useAuth} from '../../providers/AuthProvider';

interface RouteParams {
  splitExpenseId: string;
}

interface ParticipantDetail {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  amountOwed: number;
  amountPaid: number;
  isPayer: boolean;
  status: string;
  settledAt?: string;
}

interface Settlement {
  id: string;
  payerName: string;
  payeeName: string;
  amount: number;
  settledAt: string;
  note?: string;
}

const SplitExpenseDetail = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {splitExpenseId} = route.params as RouteParams;
  const {theme} = useTheme();
  const {user} = useAuth();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<SplitExpense | null>(null);
  const [participants, setParticipants] = useState<ParticipantDetail[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await splitExpenseApi.getDetails(splitExpenseId);
      if (response.data.success) {
        setExpense(response.data.data as any);
        setParticipants((response.data.data as any).participants || []);
        setSettlements((response.data.data as any).settlements || []);
      }
    } catch (error) {
      console.error('Error fetching split expense details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [splitExpenseId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Split Expense',
      'Are you sure you want to delete this split expense? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const response = await splitExpenseApi.delete(splitExpenseId);
              if (response.data.success) {
                Alert.alert('Deleted', 'Split expense has been deleted');
                navigation.goBack();
              } else {
                Alert.alert(
                  'Error',
                  response.data.message || 'Failed to delete',
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete split expense');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleSettle = (participant: ParticipantDetail) => {
    const payer = participants.find(p => p.isPayer);
    if (!payer) return;

    navigation.navigate('SettlementScreen', {
      splitExpenseId,
      friendId: participant.userId,
      friendName: `${participant.firstName} ${participant.lastName}`,
      amountOwed: participant.amountOwed - participant.amountPaid,
      payerId: participant.userId,
      payeeId: payer.userId,
    });
  };

  const handleSendReminder = (participant: ParticipantDetail) => {
    navigation.navigate('FriendChat', {
      id: participant.userId,
      firstName: participant.firstName,
      lastName: participant.lastName,
      image: participant.profilePicture || '',
      lastMessage: `Reminder: You owe ₹${(
        participant.amountOwed - participant.amountPaid
      ).toFixed(2)} for "${expense?.description}"`,
      lastMessageTime: new Date().toISOString(),
    });
  };

  const payer = participants.find(p => p.isPayer);
  const isCreator = expense?.createdBy === user?.userId;
  const canDelete = isCreator && expense?.status === 'pending';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    summaryCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
    },
    summaryAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 8,
    },
    summaryDescription: {
      fontSize: 18,
      color: '#fff',
      textAlign: 'center',
      opacity: 0.9,
    },
    summaryDate: {
      fontSize: 14,
      color: '#fff',
      textAlign: 'center',
      opacity: 0.7,
      marginTop: 8,
    },
    statusBadge: {
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 12,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      ...commonStyles.textDefault,
    },
    participantCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    participantAvatar: {
      marginRight: 12,
    },
    participantInfo: {
      flex: 1,
    },
    participantName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      ...commonStyles.textDefault,
    },
    participantStatus: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 2,
    },
    participantAmount: {
      alignItems: 'flex-end',
    },
    payerBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginTop: 4,
    },
    payerBadgeText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
    },
    settleButton: {
      backgroundColor: '#22c55e',
    },
    reminderButton: {
      backgroundColor: colors.primary,
    },
    settlementCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    settlementInfo: {
      flex: 1,
      marginLeft: 12,
    },
    settlementText: {
      fontSize: 14,
      color: colors.text,
      ...commonStyles.textDefault,
    },
    settlementDate: {
      fontSize: 12,
      color: colors.mutedText,
      marginTop: 2,
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      ...commonStyles.textDefault,
    },
    emptyText: {
      color: colors.mutedText,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Split Details" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.container}>
        <Header title="Split Details" showBack />
        <View style={styles.loadingContainer}>
          <Text style={{color: colors.text}}>Split expense not found</Text>
        </View>
      </View>
    );
  }

  const statusColor =
    expense.status === 'settled'
      ? '#22c55e'
      : expense.status === 'partially_settled'
      ? '#f59e0b'
      : '#3b82f6';

  return (
    <View style={styles.container}>
      <Header title="Split Details" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryAmount}>
            ₹{parseFloat(expense.totalAmount.toString()).toFixed(2)}
          </Text>
          <Text style={styles.summaryDescription}>{expense.description}</Text>
          <Text style={styles.summaryDate}>
            {new Date(expense.expenseDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <View
            style={[styles.statusBadge, {backgroundColor: statusColor + '30'}]}>
            <Text style={[styles.statusText, {color: statusColor}]}>
              {expense.status === 'settled'
                ? '✓ Settled'
                : expense.status === 'partially_settled'
                ? 'Partially Settled'
                : 'Pending'}
            </Text>
          </View>
        </View>

        {/* Paid By */}
        {payer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paid by</Text>
            <View style={styles.participantCard}>
              <Icon name="account-circle" size={40} color={colors.primary} />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {payer.firstName} {payer.lastName}
                  {payer.userId === user?.userId && ' (You)'}
                </Text>
              </View>
              <RupeeIcon
                amount={parseFloat(expense.totalAmount.toString())}
                size={16}
                color={colors.primary}
              />
            </View>
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split between</Text>
          {participants
            .filter(p => !p.isPayer)
            .map(participant => {
              const remaining = participant.amountOwed - participant.amountPaid;
              const isSettled = participant.status === 'settled';
              const canSettle = !isSettled && payer?.userId === user?.userId;

              return (
                <View key={participant.id} style={styles.participantCard}>
                  <Icon
                    name="account-circle"
                    size={40}
                    color={isSettled ? '#22c55e' : colors.mutedText}
                    style={styles.participantAvatar}
                  />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {participant.firstName} {participant.lastName}
                      {participant.userId === user?.userId && ' (You)'}
                    </Text>
                    <Text style={styles.participantStatus}>
                      {isSettled
                        ? '✓ Settled'
                        : `Owes ₹${remaining.toFixed(2)}`}
                    </Text>
                  </View>
                  <View style={styles.participantAmount}>
                    <RupeeIcon
                      amount={participant.amountOwed}
                      size={14}
                      color={isSettled ? '#22c55e' : colors.text}
                    />
                  </View>
                  {canSettle && !isSettled && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.settleButton]}
                        onPress={() => handleSettle(participant)}>
                        <Icon name="check" size={18} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.reminderButton]}
                        onPress={() => handleSendReminder(participant)}>
                        <Icon name="bell" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
        </View>

        {/* Settlement History */}
        {settlements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settlement History</Text>
            {settlements.map(settlement => (
              <View key={settlement.id} style={styles.settlementCard}>
                <Icon name="check-circle" size={24} color="#22c55e" />
                <View style={styles.settlementInfo}>
                  <Text style={styles.settlementText}>
                    {settlement.payerName} paid {settlement.payeeName}
                  </Text>
                  <Text style={styles.settlementDate}>
                    {new Date(settlement.settledAt).toLocaleDateString('en-IN')}
                    {settlement.note && ` • ${settlement.note}`}
                  </Text>
                </View>
                <RupeeIcon
                  amount={settlement.amount}
                  size={14}
                  color="#22c55e"
                />
              </View>
            ))}
          </View>
        )}

        {/* Delete Button */}
        {canDelete && (
          <TouchableOpacity
            style={[styles.deleteButton, deleting && {opacity: 0.6}]}
            onPress={handleDelete}
            disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Split Expense</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default SplitExpenseDetail;
