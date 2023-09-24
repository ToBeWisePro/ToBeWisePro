import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { PlayButtonBar } from "./PlayButtonBar"; // Update the import path
import { TEST_IDS } from "../../res/constants/TestIDs";

describe("<PlayButtonBar />", () => {
  let setPlayPressedMock: jest.Mock<any, any, any>;
  let playPressed: boolean;

  beforeEach(() => {
    setPlayPressedMock = jest.fn();
    playPressed = false;
  });

  it("should render correctly", () => {
    const { getByText } = render(
      <PlayButtonBar
        setPlayPressed={setPlayPressedMock}
        playPressed={playPressed}
      />,
    );

    expect(getByText("Slower")).toBeTruthy();
    expect(getByText("Play/Pause")).toBeTruthy();
    expect(getByText("Faster")).toBeTruthy();
  });

  it("should call setPlayPressed with true when play button is pressed", () => {
    const { getByTestId } = render(
      <PlayButtonBar
        setPlayPressed={setPlayPressedMock}
        playPressed={playPressed}
      />,
    );

    const button = getByTestId(TEST_IDS.PlayButtonBar);
    fireEvent.press(button);

    expect(setPlayPressedMock).toHaveBeenCalledWith(true);
  });

  it("should call setPlayPressed with false when pause button is pressed", () => {
    playPressed = true;
    const { getByTestId } = render(
      <PlayButtonBar
        setPlayPressed={setPlayPressedMock}
        playPressed={playPressed}
      />,
    );

    const button = getByTestId(TEST_IDS.PlayButtonBar);
    fireEvent.press(button);

    expect(setPlayPressedMock).toHaveBeenCalledWith(false);
  });

  it("should display the pause icon when playPressed is true", () => {
    playPressed = true;
    const { queryByTestId } = render(
      <PlayButtonBar
        setPlayPressed={setPlayPressedMock}
        playPressed={playPressed}
      />,
    );

    expect(queryByTestId("icon-pause-selected")).toBeTruthy();
  });

  it("should display the play icon when playPressed is false", () => {
    const { queryByTestId } = render(
      <PlayButtonBar
        setPlayPressed={setPlayPressedMock}
        playPressed={playPressed}
      />,
    );

    expect(queryByTestId("icon-play-circle-outline-selected")).toBeTruthy();
  });
});
