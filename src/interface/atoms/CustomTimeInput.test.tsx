import * as React from "react";
import { render, type RenderAPI } from "@testing-library/react-native";
import { CustomTimeInput } from "./CustomTimeInput"; // adjust the import path accordingly
import { TEST_IDS } from "../../res/constants/TestIDs";

let onChangeMock: (event: any, selectedDate?: Date) => void;

jest.mock("@react-native-community/datetimepicker", () => (props: any) => {
  onChangeMock = props.onChange;
  return null;
});

describe("CustomTimeInput Component", () => {
  let setTimeMock: jest.Mock;
  let component: RenderAPI;

  beforeEach(() => {
    setTimeMock = jest.fn();
    component = render(<CustomTimeInput time={1300} setTime={setTimeMock} />);
  });

  it("should render correctly", () => {
    expect(component.getByTestId(TEST_IDS.dateTimePicker)).toBeDefined();
  });

  it("should call setTime with correct value when date is changed", () => {
    const newDate = new Date();
    newDate.setHours(14, 30); // 2:30 PM

    // Call the stored onChangeMock
    onChangeMock(undefined, newDate);

    expect(setTimeMock).toHaveBeenCalledWith(1430); // 2:30 PM in your time format
  });
});
