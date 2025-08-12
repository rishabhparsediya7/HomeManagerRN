import React, {FC, useMemo, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

const MONTHS = [
  {label: 'January', value: 1},
  {label: 'February', value: 2},
  {label: 'March', value: 3},
  {label: 'April', value: 4},
  {label: 'May', value: 5},
  {label: 'June', value: 6},
  {label: 'July', value: 7},
  {label: 'August', value: 8},
  {label: 'September', value: 9},
  {label: 'October', value: 10},
  {label: 'November', value: 11},
  {label: 'December', value: 12},
];

interface AnimatedListItemProps {
  index: number;
  label: string;
  scrollY: Animated.SharedValue<number>;
  textStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  onPress: (index: number) => void; // Add onPress prop
}

const AnimatedListItem: FC<AnimatedListItemProps> = ({
  index,
  label,
  scrollY,
  textStyle,
  selectedTextStyle,
  onPress,
}) => {
  const baseFontSize = textStyle?.fontSize ?? 18;
  const selectedFontSize = selectedTextStyle?.fontSize ?? 22;

  const animatedStyle = useAnimatedStyle(() => {
    const itemY = index * ITEM_HEIGHT;
    const distance = Math.abs(scrollY.value - itemY);
    const fontSize = interpolate(
      distance,
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [selectedFontSize, baseFontSize, baseFontSize - 2],
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      distance,
      [0, ITEM_HEIGHT, ITEM_HEIGHT * 2],
      [1, 0.7, 0.4],
      Extrapolate.CLAMP,
    );

    return {
      fontSize,
      opacity,
    };
  });

  return (
    <TouchableOpacity onPress={() => onPress(index)} activeOpacity={0.7}>
      <View style={styles.itemContainer}>
        <Animated.Text style={[styles.itemText, textStyle, animatedStyle]}>
          {label}
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

interface MonthYearPickerProps {
  date: {month: number; year: number};
  onDateChange: (newDate: {month: number; year: number}) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  highlightColor?: string;
  yearRange?: {start: number; end: number};
}

export const MonthYearPicker: FC<MonthYearPickerProps> = ({
  date,
  onDateChange,
  style,
  textStyle,
  selectedTextStyle,
  highlightColor = '#E0E0E0',
  yearRange,
}) => {
  const monthListRef = useRef<Animated.FlatList<any>>(null);
  const yearListRef = useRef<Animated.FlatList<any>>(null);

  const monthScrollY = useSharedValue(0);
  const yearScrollY = useSharedValue(0);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = yearRange?.start ?? currentYear - 50;
    const endYear = yearRange?.end ?? currentYear + 50;
    return Array.from(
      {length: endYear - startYear + 1},
      (_, i) => startYear + i,
    );
  }, [yearRange]);

  useEffect(() => {
    const monthIndex = MONTHS.findIndex(m => m.value === date.month);
    if (monthIndex !== -1) {
      monthScrollY.value = monthIndex * ITEM_HEIGHT;
      monthListRef.current?.scrollToOffset({
        offset: monthScrollY.value,
        animated: false,
      });
    }
    const yearIndex = years.indexOf(date.year);
    if (yearIndex !== -1) {
      yearScrollY.value = yearIndex * ITEM_HEIGHT;
      yearListRef.current?.scrollToOffset({
        offset: yearScrollY.value,
        animated: false,
      });
    }
  }, []);

  const updateDate = (newDate: {month: number; year: number}) => {
    onDateChange(newDate);
  };

  const onMonthPress = (index: number) => {
    monthListRef.current?.scrollToIndex({index, animated: true});
  };

  const onYearPress = (index: number) => {
    yearListRef.current?.scrollToIndex({index, animated: true});
  };

  const monthScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      monthScrollY.value = event.contentOffset.y;
    },
    onMomentumEnd: event => {
      'worklet';
      const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
      if (index >= 0 && index < MONTHS.length) {
        const newMonth = MONTHS[index].value;
        if (newMonth !== date.month) {
          runOnJS(updateDate)({year: date.year, month: newMonth});
        }
      }
    },
  });

  const yearScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      yearScrollY.value = event.contentOffset.y;
    },
    onMomentumEnd: event => {
      'worklet';
      const index = Math.round(event.contentOffset.y / ITEM_HEIGHT);
      if (index >= 0 && index < years.length) {
        const newYear = years[index];
        if (newYear !== date.year) {
          runOnJS(updateDate)({month: date.month, year: newYear});
        }
      }
    },
  });

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View
      style={[styles.container, {height: ITEM_HEIGHT * VISIBLE_ITEMS}, style]}>
      <View style={[styles.highlightBar, {backgroundColor: highlightColor}]} />
      <View style={styles.pickerContainer}>
        <View style={styles.column}>
          <Animated.FlatList
            ref={monthListRef}
            data={MONTHS}
            renderItem={({item, index}) => (
              <AnimatedListItem
                index={index}
                label={item.label}
                scrollY={monthScrollY}
                textStyle={textStyle}
                selectedTextStyle={selectedTextStyle}
                onPress={onMonthPress}
              />
            )}
            keyExtractor={item => item.value.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.listContentContainer}
            onScroll={monthScrollHandler}
            nestedScrollEnabled
          />
        </View>
        <View style={styles.column}>
          <Animated.FlatList
            ref={yearListRef}
            data={years}
            renderItem={({item, index}) => (
              <AnimatedListItem
                index={index}
                label={item.toString()}
                scrollY={yearScrollY}
                textStyle={textStyle}
                selectedTextStyle={selectedTextStyle}
                onPress={onYearPress}
              />
            )}
            keyExtractor={item => item.toString()}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            getItemLayout={getItemLayout}
            contentContainerStyle={styles.listContentContainer}
            onScroll={yearScrollHandler}
            nestedScrollEnabled
          />
        </View>
      </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    height: '100%',
  },
  listContentContainer: {
    paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
  highlightBar: {
    position: 'absolute',
    width: '100%',
    height: ITEM_HEIGHT,
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    zIndex: -1,
    opacity: 0.2,
  },
});
