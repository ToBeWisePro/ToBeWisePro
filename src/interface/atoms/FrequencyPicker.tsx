import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const FrequencySelector = ({ selectedTime, onTimeChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  const onClear = () => {
    onTimeChange(null);
  };

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onTimeChange(selectedDate);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openPicker} style={styles.timeDisplay}>
        <Text>
          {selectedTime
            ? `${selectedTime.getHours()}:${selectedTime.getMinutes()}`
            : 'Select Time'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <Text>Clear</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  clearButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default FrequencySelector;
