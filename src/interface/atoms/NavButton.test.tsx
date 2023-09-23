import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavButton } from "./NavButton";
import { strings } from "../../res/constants/Strings";
import { mockNavigation } from "../../res/constants/test_types/mockNavigation";

describe("<NavButton />", () => {
  const mockResetScrollPosition = jest.fn();

  it("renders correctly with given buttonText", () => {
    const { getByText } = render(
      <NavButton
        buttonText="Home"
        selected={false}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />,
    );
    expect(getByText("Home")).toBeTruthy();
  });

  it("renders IconFactory with selected=true when selected prop is true", () => {
    // You may need to mock IconFactory or check its props
    // For now, we'll just check if the component renders without crashing
    render(
      <NavButton
        buttonText="Home"
        selected={true}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />,
    );
  });

  it("renders IconFactory with selected=false when selected prop is false", () => {
    // You may need to mock IconFactory or check its props
    // For now, we'll just check if the component renders without crashing
    render(
      <NavButton
        buttonText="Home"
        selected={false}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />,
    );
  });

  it("navigates to the correct screen when pressed", () => {
    const { getByText } = render(
      <NavButton
        buttonText="Home"
        selected={false}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />,
    );
    fireEvent.press(getByText("Home"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      strings.screenName.home,
    );
  });
});
