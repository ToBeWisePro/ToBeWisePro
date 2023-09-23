import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CustomTimeInput } from "./CustomTimeInput";
import { TEST_IDS } from "../../res/constants/TestIDS";

jest.mock("@react-native-community/datetimepicker", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");
  const mockComponent = jest.fn(({ testID, mode, value }) => (
    <View testID={testID} mode={mode} value={value} />
  ));
  return {
    __esModule: true,
    default: mockComponent,
  };
});

describe("<CustomTimeInput />", () => {
  const mockTime = new Date(2023, 8, 7, 12, 0, 0);
  const mockSetTime = jest.fn();

  it("renders correctly", () => {
    const { getByTestId } = render(
      <CustomTimeInput time={mockTime} setTime={mockSetTime} />,
    );
    fireEvent.press(getByTestId("touchableOpacityTestId")); // Ensure TouchableOpacity has this testID
    expect(getByTestId(TEST_IDS.dateTimePicker)).toBeTruthy();
  });

  it("has correct mode and value in DateTimePicker", () => {
    const { getByTestId } = render(
      <CustomTimeInput time={mockTime} setTime={mockSetTime} />,
    );
    fireEvent.press(getByTestId("touchableOpacityTestId")); // Ensure TouchableOpacity has this testID
    const picker = getByTestId(TEST_IDS.dateTimePicker);
    expect(picker.props.mode).toBe("time");
    expect(picker.props.value).toEqual(mockTime);
  });

  it("calls setTime when DateTimePicker onChange event is triggered", () => {
    const { getByTestId } = render(
      <CustomTimeInput time={mockTime} setTime={mockSetTime} />,
    );
    fireEvent.press(getByTestId("touchableOpacityTestId")); // Ensure TouchableOpacity has this testID
    const picker = getByTestId(TEST_IDS.dateTimePicker);
    const newTime = new Date(2023, 8, 7, 13, 0, 0);
    fireEvent(picker, "onChange", { type: "set" }, newTime);
    expect(mockSetTime).toHaveBeenCalledWith(newTime);
  });
});
