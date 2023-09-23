import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DataButton } from "./DataButton";

describe("<DataButton />", () => {
  const mockOnPress = jest.fn();
  const buttonText = "Test Button";

  it("renders correctly", () => {
    const { getByText } = render(
      <DataButton
        buttonText={buttonText}
        selected={false}
        onPress={mockOnPress}
      />,
    );
    expect(getByText(buttonText)).toBeTruthy();
  });

  it("displays the correct button text", () => {
    const { getByText } = render(
      <DataButton
        buttonText={buttonText}
        selected={false}
        onPress={mockOnPress}
      />,
    );
    expect(getByText(buttonText)).toBeTruthy();
  });

  //   it('changes background color when selected', async () => {
  //     const { getByText, rerender } = render(
  //       <DataButton buttonText={buttonText} selected={false} onPress={mockOnPress} />
  //     );
  //     const button = getByText(buttonText).parent;

  //     // Log the style prop to debug
  //     console.log(button.props.style);

  //     expect(button.props.style[1].color).toBe(GRAY_3);

  //     rerender(<DataButton buttonText={buttonText} selected={true} onPress={mockOnPress} />);

  //     await waitFor(() => {
  //       expect(button.props.style[1].color).toBe(PRIMARY_GREEN);
  //     });
  //   });

  it("calls onPress when button is pressed", () => {
    const { getByText } = render(
      <DataButton
        buttonText={buttonText}
        selected={false}
        onPress={mockOnPress}
      />,
    );
    const button = getByText(buttonText);
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalled();
  });
});
