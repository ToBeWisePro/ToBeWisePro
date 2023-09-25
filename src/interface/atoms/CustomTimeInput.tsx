import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { LIGHT } from "../../../styles/Colors";
import { TEST_IDS } from "../../res/constants/TestIDs";

interface Props {
  time: number;
  setTime: (x: number) => void;
}

export const CustomTimeInput: React.FC<Props> = ({ time, setTime }: Props) => {
  // Construct a Date object from the time integer
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  const currentDate = new Date();
  currentDate.setHours(hours, minutes);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (selectedDate != null) {
      // Convert the selected Date object back to a time integer
      const newTime = selectedDate.getHours() * 100 + selectedDate.getMinutes();
      setTime(newTime);
    }
  };

  return (
    <TouchableOpacity style={styles.container} testID={TEST_IDS.dateTimePicker}>
      <DateTimePicker
        mode={"time"}
        value={currentDate} // passing Date object instead of time integer
        onChange={onChange}
        testID={TEST_IDS.touchableOpacityTestId}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "80%",
    width: 100,
    backgroundColor: LIGHT,
  },
});
