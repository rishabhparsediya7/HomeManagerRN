import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {getWeekDates, formatDateToDMY} from '../../utils/dates';
import {View, Text} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CalendarViewer = ({
  setDate,
}: {
  setDate: Dispatch<SetStateAction<Date>>;
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekData, setWeekData] = useState(getWeekDates(new Date()));

  useEffect(() => {
    const newWeekData = getWeekDates(selectedDate);
    setWeekData(newWeekData);
    setDate(selectedDate);
  }, [selectedDate, setDate]);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const selectedDateStr = formatDateToDMY(selectedDate);

  return (
    <View>
      <View style={styles.calendarWrapper}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigateWeek('prev')}>
            <Icon name="chevron-left" size={24} color="black" />
          </Pressable>
          <Text style={styles.monthText}>{weekData.month}</Text>
          <Pressable onPress={() => navigateWeek('next')}>
            <Icon name="chevron-right" size={24} color="black" />
          </Pressable>
        </View>
        <View style={styles.calendarContainer}>
          {weekData.weekDates.map(day => (
            <Pressable
              key={day.date}
              onPress={() => setSelectedDate(new Date(day.isoDate))}
              style={[
                styles.dayContainer,
                selectedDateStr === day.date && styles.selectedDay,
              ]}>
              <View style={styles.dot} />
              <Text
                style={[
                  styles.dayText,
                  selectedDateStr === day.date && styles.selectedText,
                ]}>
                {day.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedDateStr === day.date && styles.selectedText,
                ]}>
                {day.date.split('-')[0]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Pressable onPress={showDatePicker} style={styles.moreDatesButton}>
        <Text style={styles.moreDatesText}>Show more dates</Text>
      </Pressable>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarWrapper: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    rowGap: 8,
  },
  headerContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    borderRadius: 10,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  dayContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: 'orange',
  },
  dot: {
    height: 4,
    width: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  selectedText: {
    color: 'white',
  },
  moreDatesButton: {
    marginTop: 12,
  },
  moreDatesText: {
    alignSelf: 'flex-end',
    color: '#0e98fb',
    fontSize: 16,
  },
});

export default CalendarViewer;
