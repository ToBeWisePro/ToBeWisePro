import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FrequencySelector from "./FrequencySelector";
import { TEST_IDS } from "../../res/constants/TestIDS";

jest.mock("@react-native-community/datetimepicker", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((props) => {
      return (
        <div
          data-testid="dateTimePicker" // Directly use the string value
          onChange={() => props.onChange({}, new Date(2022, 9, 7, 12, 30))}
          {...props}
        ></div>
      );
    }),
  };
});

describe("<FrequencySelector />", () => {
  it("renders correctly with initial text", () => {
    const { getByText } = render(
      <FrequencySelector selectedTime={null} onTimeChange={jest.fn()} />,
    );
    expect(getByText("Select Time")).toBeTruthy();
  });

  it("opens DateTimePicker when Select Time button is pressed", () => {
    const { getByTestId } = render(
      <FrequencySelector selectedTime={null} onTimeChange={jest.fn()} />,
    );
    fireEvent.press(getByTestId(TEST_IDS.selectTimeButton));
    expect(getByTestId(TEST_IDS.dateTimePicker)).toBeTruthy();
  });

  it("calls onTimeChange with null when Clear button is pressed", () => {
    const mockOnTimeChange = jest.fn();
    const { getByTestId } = render(
      <FrequencySelector
        selectedTime={new Date()}
        onTimeChange={mockOnTimeChange}
      />,
    );
    fireEvent.press(getByTestId(TEST_IDS.clearButton));
    expect(mockOnTimeChange).toHaveBeenCalledWith(null);
  });

  it("calls onTimeChange with selected date when a time is picked", () => {
    const mockOnTimeChange = jest.fn();
    const { getByText, getByTestId } = render(
      <FrequencySelector selectedTime={null} onTimeChange={mockOnTimeChange} />,
    );
    fireEvent.press(getByText("Select Time"));
    fireEvent(
      getByTestId(TEST_IDS.dateTimePicker),
      "onChange",
      undefined,
      new Date(2022, 9, 7, 12, 30),
    );
    expect(mockOnTimeChange).toHaveBeenCalledWith(new Date(2022, 9, 7, 12, 30));
  });
});
