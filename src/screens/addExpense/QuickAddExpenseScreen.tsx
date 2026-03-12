import {useNavigation} from '@react-navigation/native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated as CoreAnimated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppInput from '@molecules/AppInput';
import AppText from '@atoms/AppText';
import Header from '@organisms/Header';
import {darkTheme, lightTheme} from '../../providers/Theme';
import {useTheme} from '../../providers/ThemeContext';
import api from '../../services/api';
import {useHomeStore} from '../../store';
import {formatDate} from '../../utils/formatDate';

interface DraftExpense {
  description: string;
  amount: number;
  expenseDate: string;
}

const QuickAddExpenseScreen = () => {
  const [rawText, setRawText] = useState('');
  const [drafts, setDrafts] = useState<DraftExpense[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {theme} = useTheme();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {addExpenseToRecent} = useHomeStore();

  // Pulse animation for the Magic button
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, {duration: 1000}),
        withTiming(1, {duration: 1000}),
      ),
      -1,
      true,
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulse.value}],
  }));

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState<number | null>(null);
  const firstItemSwipeableRef = useRef<Swipeable>(null);

  // Trigger peek animation when drafts are populated
  useEffect(() => {
    if (drafts.length > 0 && firstItemSwipeableRef.current) {
      const timer = setTimeout(() => {
        firstItemSwipeableRef.current?.openRight();
        setTimeout(() => {
          firstItemSwipeableRef.current?.close();
        }, 1000);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [drafts.length === 0]); // Trigger when first newly populated

  const handleParse = async () => {
    if (!rawText.trim()) {
      Alert.alert('Error', 'Please enter some text for the AI to analyze');
      return;
    }
    setDrafts([]); // Clear previous drafts on new parse
    setIsParsing(true);
    try {
      const response = await api.post('/api/expense/parse-text', {rawText});
      if (response.data?.success) {
        setDrafts(response.data.data);
      } else {
        Alert.alert('Error', 'AI failed to parse text');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'AI service is currently unavailable');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateDraft = useCallback(
    (index: number, field: keyof DraftExpense, value: string) => {
      setDrafts(prev => {
        const updated = [...prev];
        if (field === 'amount') {
          updated[index].amount = parseFloat(value) || 0;
        } else if (field === 'expenseDate') {
          updated[index].expenseDate = value;
        } else {
          updated[index].description = value;
        }
        return updated;
      });
    },
    [],
  );

  const handleConfirmDate = useCallback(
    (date: Date) => {
      if (activeDateIndex !== null) {
        handleUpdateDraft(activeDateIndex, 'expenseDate', date.toISOString());
      }
      setIsDatePickerVisible(false);
      setActiveDateIndex(null);
    },
    [activeDateIndex, handleUpdateDraft],
  );

  const handleRemoveDraft = useCallback((index: number) => {
    setDrafts(prev => prev.filter((_, i) => i !== index));
    setEditingIndex(prev => (prev === index ? null : prev));
  }, []);

  const handleAddExpenses = async () => {
    if (drafts.length === 0) {
      Alert.alert('Error', 'No expenses to save');
      return;
    }
    setIsSaving(true);
    try {
      const response = await api.post('/api/expense/bulk-add', {
        verifiedExpenses: drafts,
      });
      if (response.data?.success) {
        // Sync saved expenses to home screen
        const savedExpenses = response.data?.data;
        if (Array.isArray(savedExpenses)) {
          savedExpenses.forEach((expense: any) => addExpenseToRecent(expense));
        }
        Alert.alert(
          'Success ✨',
          `AI successfully added ${drafts.length} expenses`,
          [{text: 'Awesome', onPress: () => navigation.goBack()}],
        );
      } else {
        Alert.alert(
          'Error',
          response.data?.message || 'Failed to sync with database',
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save expenses. Check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const onEditDate = useCallback((idx: number) => {
    setActiveDateIndex(idx);
    setIsDatePickerVisible(true);
  }, []);

  const onLongPressItem = useCallback((idx: number) => {
    setEditingIndex(prev => (prev === idx ? null : idx));
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: 20,
          paddingBottom: 40,
        },
        inputContainer: {
          marginBottom: 20,
        },
        magicButton: {
          borderRadius: 16,
          overflow: 'hidden',
          marginTop: 15,
          width: '100%',
          height: 56, // Explicit height
        },
        magicGradient: {
          height: 56, // Match button height
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          width: '100%',
          gap: 12,
        },
        magicText: {
          color: '#FFFFFF',
        },
        draftHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
          marginTop: 25,
        },
        cardWrapper: {
          // Margin removed for seamless list
        },
        draftCard: {
          overflow: 'hidden',
        },
        rowContainer: {
          paddingLeft: 12,
          paddingVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        },
        divider: {
          height: 1,
          backgroundColor: colors.inputText + '15',
          marginHorizontal: 0,
        },
        draftInfo: {
          flex: 1,
          marginRight: 10,
        },
        draftRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        draftDescription: {
          color: colors.buttonText,
          flex: 1,
        },
        draftAmount: {
          color: '#6C63FF',
          marginLeft: 10,
        },
        actionBtn: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 8,
        },
        saveBtnInner: {
          backgroundColor: '#4CAF5015',
        },
        deleteAction: {
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: '100%',
        },
        editingContainer: {
          flex: 1,
          marginRight: 10,
        },
        cardLabel: {
          fontSize: 10,
          color: colors.inputText + '80',
          marginBottom: 2,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        emptyContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 60,
        },
        emptyText: {
          color: colors.inputText + '60',
          marginTop: 15,
          textAlign: 'center',
          lineHeight: 22,
        },
        footer: {
          marginTop: 0,
        },
        stickyFooter: {
          backgroundColor: colors.background,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: colors.inputText + '10',
        },
        aiIcon: {
          marginBottom: 10,
        },
      }),
    [colors],
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: colors.background}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header
        title="Quick Add"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={drafts}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListHeaderComponent={
          <Animated.View entering={FadeInUp} style={styles.inputContainer}>
            <AppInput
              label="AI Expense Analysis"
              placeholder="Paste text like: 'Dinner 500, Coffee with friends 120, Taxi 300'"
              value={rawText}
              onChangeText={setRawText}
              multiline
              inputStyle={{
                minHeight: 140,
                textAlignVertical: 'top',
              }}
              labelProps={{variant: 'h6', weight: 'semiBold'}}
            />

            <Animated.View>
              <TouchableOpacity
                onPress={handleParse}
                disabled={isParsing}
                style={styles.magicButton}>
                <LinearGradient
                  colors={['#6C63FF', '#3F37C9']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.magicGradient}>
                  <Icon name="auto-fix" size={20} color="#FFF" />
                  <AppText variant="h6" style={styles.magicText}>
                    {isParsing ? 'Analyzing...' : 'Magic Analyze ✨'}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {drafts.length > 0 && (
              <View>
                <Animated.View entering={FadeInDown} style={styles.draftHeader}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon
                      name="auto-fix"
                      size={20}
                      color="#6C63FF"
                      style={{marginRight: 6}}
                    />
                    <AppText variant="h6" weight="semiBold">
                      AI Proposed ({drafts.length})
                    </AppText>
                  </View>
                  <TouchableOpacity onPress={() => setDrafts([])}>
                    <AppText
                      variant="md"
                      weight="medium"
                      style={{color: colors.error}}>
                      Reset
                    </AppText>
                  </TouchableOpacity>
                </Animated.View>
                <AppText
                  variant="sm"
                  style={{
                    color: colors.inputText + '80',
                    marginBottom: 10,
                    marginTop: -10,
                  }}>
                  💡 Tip: Swipe left to delete • Long press to edit
                </AppText>
              </View>
            )}
          </Animated.View>
        }
        renderItem={({item, index}) => (
          <MemoizedDraftItem
            item={item}
            index={index}
            isEditing={editingIndex === index}
            onLongPress={onLongPressItem}
            onRemove={handleRemoveDraft}
            onUpdate={handleUpdateDraft}
            onEditDate={onEditDate}
            swipeableRef={index === 0 ? firstItemSwipeableRef : undefined}
            theme={theme}
            colors={colors}
            styles={styles}
          />
        )}
        ListEmptyComponent={
          !isParsing && drafts.length === 0 ? (
            <Animated.View entering={FadeInDown} style={styles.emptyContainer}>
              <Icon
                name="brain"
                size={64}
                color="#6C63FF"
                style={styles.aiIcon}
              />
              <AppText variant="h6" weight="medium">
                Ready for AI Magic?
              </AppText>
              <AppText variant="md" style={styles.emptyText}>
                No extra data needed. Just paste your{'\n'}unstructured notes
                and let AI do the rest!
              </AppText>
            </Animated.View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {drafts.length > 0 && (
        <Animated.View
          entering={FadeInUp}
          style={[
            styles.stickyFooter,
            {
              paddingBottom: Math.max(insets.bottom, 20),
              paddingTop: 15,
            },
          ]}>
          <TouchableOpacity
            onPress={handleAddExpenses}
            disabled={isSaving}
            style={styles.magicButton}>
            <LinearGradient
              colors={['#6C63FF', '#3F37C9']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.magicGradient}>
              <AppText variant="lg" style={styles.magicText}>
                {isSaving
                  ? 'Syncing...'
                  : `Sync ${drafts.length} Expenses with DB`}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={
          activeDateIndex !== null
            ? new Date(drafts[activeDateIndex].expenseDate)
            : new Date()
        }
        onConfirm={handleConfirmDate}
        onCancel={() => {
          setIsDatePickerVisible(false);
          setActiveDateIndex(null);
        }}
        locale="en-IN"
      />
    </KeyboardAvoidingView>
  );
};

export default QuickAddExpenseScreen;

interface DraftItemProps {
  item: DraftExpense;
  index: number;
  isEditing: boolean;
  onLongPress: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof DraftExpense, value: string) => void;
  onEditDate: (index: number) => void;
  swipeableRef?: React.Ref<Swipeable>;
  theme: any;
  colors: any;
  styles: any;
}

const MemoizedDraftItem = memo(
  ({
    item,
    index,
    isEditing,
    onLongPress,
    onRemove,
    onUpdate,
    onEditDate,
    swipeableRef,
    theme,
    colors,
    styles,
  }: DraftItemProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: scale.value}],
    }));

    const handlePressIn = () => {
      if (!isEditing) {
        scale.value = withSpring(0.96);
      }
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={() => (
          <TouchableOpacity
            onPress={() => onRemove(index)}
            style={{
              backgroundColor: colors.error,
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: '100%',
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              marginLeft: 8,
            }}>
            <Icon name="delete-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        )}
        overshootRight={false}>
        <Animated.View
          entering={FadeInDown.delay(index * 50)}
          layout={Layout.springify()}
          style={[styles.cardWrapper, animatedStyle]}>
          <View style={styles.draftCard}>
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => onLongPress(index)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isEditing}
              style={[
                styles.rowContainer,
                {
                  backgroundColor:
                    theme === 'dark' ? colors.cardBackground : '#FFF',
                },
              ]}>
              {isEditing ? (
                <View style={{flex: 1}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      gap: 12,
                      marginBottom: 12,
                    }}>
                    <View style={{flex: 1}}>
                      <Text style={styles.cardLabel}>Description</Text>
                      <AppInput
                        value={item.description}
                        onChangeText={val =>
                          onUpdate(index, 'description', val)
                        }
                        containerStyle={{marginBottom: 0}}
                        inputStyle={{
                          fontSize: 14,
                          paddingVertical: 4,
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                        }}
                        autoFocus
                      />
                    </View>
                    <View style={{width: 100}}>
                      <Text style={styles.cardLabel}>Amount</Text>
                      <AppInput
                        value={item.amount.toString()}
                        onChangeText={val => onUpdate(index, 'amount', val)}
                        keyboardType="numeric"
                        containerStyle={{marginBottom: 0}}
                        inputStyle={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#6C63FF',
                          paddingVertical: 4,
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                        }}
                        leftIcon={
                          <Icon name="currency-inr" size={16} color="#6C63FF" />
                        }
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      gap: 12,
                    }}>
                    <View style={{flex: 1}}>
                      <Text style={styles.cardLabel}>Date</Text>
                      <TouchableOpacity
                        onPress={() => onEditDate(index)}
                        style={{
                          paddingVertical: 4,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <Icon
                          name="calendar-edit"
                          size={16}
                          color={colors.buttonText}
                          style={{marginRight: 6}}
                        />
                        <AppText
                          variant="md"
                          weight="medium"
                          style={{fontSize: 13}}>
                          {formatDate(item.expenseDate)}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => onLongPress(index)}
                      style={[
                        styles.actionBtn,
                        styles.saveBtnInner,
                        {marginBottom: 0, marginTop: 0, marginLeft: 'auto'},
                      ]}>
                      <Icon name="check" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.draftInfo}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <AppText
                      variant="lg"
                      numberOfLines={1}
                      style={styles.draftDescription}>
                      {item.description}
                    </AppText>
                    <AppText
                      variant="lg"
                      weight="medium"
                      style={styles.draftAmount}>
                      ₹{item.amount}
                    </AppText>
                  </View>
                  <AppText
                    variant="sm"
                    weight="medium"
                    style={{color: colors.inputText + '80', marginTop: 4}}>
                    {formatDate(item.expenseDate)}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Swipeable>
    );
  },
);
