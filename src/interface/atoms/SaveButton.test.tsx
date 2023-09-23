import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SaveButton } from "./SaveButton"; // Adjust the import to your file structure
import { strings } from "../../res/constants/Strings";

// Mock navigation and route
const mockNavigation: any = {
  push: jest.fn(),
};
const mockRoute: any = {};

describe("SaveButton component", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <SaveButton
        active={true}
        pressFunction={jest.fn()}
        navigation={mockNavigation}
        route={mockRoute}
        newQuote={true}
      />,
    );
    expect(getByText(strings.copy.saveButton)).toBeDefined();
  });

  it("changes button title based on newQuote prop", () => {
    const { getByText, rerender } = render(
      <SaveButton
        active={true}
        pressFunction={jest.fn()}
        navigation={mockNavigation}
        route={mockRoute}
        newQuote={true}
      />,
    );
    expect(getByText(strings.copy.saveButton)).toBeDefined();

    rerender(
      <SaveButton
        active={true}
        pressFunction={jest.fn()}
        navigation={mockNavigation}
        route={mockRoute}
        newQuote={false}
      />,
    );
    expect(getByText(strings.copy.saveButtonBlank)).toBeDefined();
  });

  it("calls pressFunction when button is pressed", () => {
    const mockPressFunction = jest.fn();
    const { getByText } = render(
      <SaveButton
        active={true}
        pressFunction={mockPressFunction}
        navigation={mockNavigation}
        route={mockRoute}
        newQuote={true}
      />,
    );

    fireEvent.press(getByText(strings.copy.saveButton));
    expect(mockPressFunction).toHaveBeenCalled();
  });
});
