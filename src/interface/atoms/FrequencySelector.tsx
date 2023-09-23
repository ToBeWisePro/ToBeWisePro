import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import DateTimePicker, {
  type Event,
} from "@react-native-community/datetimepicker";
import { TEST_IDS } from "../../res/constants/TestIDS";

interface FrequencySelectorProps {
  selectedTime: Date | null;
  onTimeChange: (date: Date | null) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  selectedTime,
  onTimeChange,
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const onClear = (): void => {
    onTimeChange(null);
  };

  const onChange = (event: Event, selectedDate?: Date): void => {
    setShowPicker(false);
    if (selectedDate != null) {
      onTimeChange(selectedDate);
    }
  };

  const openPicker = (): void => {
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={openPicker}
        style={styles.timeDisplay}
        testID={TEST_IDS.selectTimeButton}
      >
        <Text>
          {selectedTime != null
            ? `${selectedTime.getHours()}:${selectedTime.getMinutes()}`
            : "Select Time"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onClear}
        style={styles.clearButton}
        testID={TEST_IDS.clearButton}
      >
        <Text>Clear</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedTime ?? new Date()}
          mode="time"
          display="default"
          onChange={(event: any, selectedDate?: Date) => {
            onChange(event as Event, selectedDate);
          }}
          testID={TEST_IDS.dateTimePicker}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: "gray",
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
