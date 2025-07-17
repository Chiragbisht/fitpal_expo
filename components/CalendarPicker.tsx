import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface CalendarPickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPicker({ selectedDate, onDateSelect, visible, onClose }: CalendarPickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const isDateInFuture = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date > today;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View entering={SlideInUp.duration(300)} style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Birthday</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Month/Year Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
              <Feather name="chevron-left" size={20} color="#4ADE80" />
            </TouchableOpacity>
            <Text style={styles.monthYearText}>
              {months[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
              <Feather name="chevron-right" size={20} color="#4ADE80" />
            </TouchableOpacity>
          </View>

          {/* Days of Week Header */}
          <View style={styles.daysHeader}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.dayHeaderText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day && isDateSelected(day) && styles.selectedDay,
                  day && isDateInFuture(day) && styles.disabledDay,
                ]}
                onPress={() => day && !isDateInFuture(day) && handleDateSelect(day)}
                disabled={!day || isDateInFuture(day)}
              >
                {day && (
                  <Text
                    style={[
                      styles.dayText,
                      isDateSelected(day) && styles.selectedDayText,
                      isDateInFuture(day) && styles.disabledDayText,
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Select Buttons */}
          <View style={styles.quickSelect}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                const date25 = new Date();
                date25.setFullYear(date25.getFullYear() - 25);
                setCurrentMonth(date25.getMonth());
                setCurrentYear(date25.getFullYear());
              }}
            >
              <Text style={styles.quickButtonText}>25 years ago</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={() => {
                const date30 = new Date();
                date30.setFullYear(date30.getFullYear() - 30);
                setCurrentMonth(date30.getMonth());
                setCurrentYear(date30.getFullYear());
              }}
            >
              <Text style={styles.quickButtonText}>30 years ago</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 20,
    padding: 20,
    width: width - 40,
    maxWidth: 350,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 32,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: '#4ADE80',
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#000000',
    fontWeight: '700',
  },
  disabledDayText: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  quickSelect: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
});