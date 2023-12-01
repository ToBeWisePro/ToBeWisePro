import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { DiscoverTile } from "./DiscoverTile";
import "@testing-library/jest-native/extend-expect";
import { getQuoteCount } from "../../backend/DBFunctions";
import { mockNavigation } from "../../res/constants/test_types/mockNavigation";

// Mocking AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(async () => await Promise.resolve(null)),
  getItem: jest.fn(async () => await Promise.resolve(null)),
}));

// Mocking DBFunctions
jest.mock("../../backend/DBFunctions.tsx", () => ({
  getQuoteCount: jest.fn(async () => await Promise.resolve(10)),
}));

const mockOnPress = jest.fn();

describe("DiscoverTile component", () => {
  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with title and count", async () => {
    // Mocking the getQuoteCount function to return 10
    (getQuoteCount as jest.Mock).mockResolvedValue(10);

    const { getByText, unmount } = render(
      <DiscoverTile
        query="Test Query"
        navigation={mockNavigation}
        filter="Test Filter"
      />,
    );

    // Waiting for the component to render and checking the text
    await waitFor(() => {
      expect(getByText("Test Query")).toBeDefined();
      expect(getByText(" (10)")).toBeDefined();
    });

    // Unmounting the component
    unmount();
  });

  it("does not call onPress when count is zero", async () => {
    // Mocking the getQuoteCount function to return 0
    (getQuoteCount as jest.Mock).mockResolvedValue(0);

    const { getByText, unmount } = render(
      <DiscoverTile
        query="Test Query"
        navigation={mockNavigation}
        filter="Test Filter"
        onPress={mockOnPress}
      />,
    );

    // Waiting for the component to render and checking the text
    await waitFor(() => {
      expect(getByText("Test Query")).toBeDefined();
      expect(getByText(" (0)")).toBeDefined();
    });

    // Simulating a press event
    fireEvent.press(getByText("Test Query"));

    // Checking that mockOnPress has not been called
    await waitFor(() => {
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    // Unmounting the component
    unmount();
  });
});
