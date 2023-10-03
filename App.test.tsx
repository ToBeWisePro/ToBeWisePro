import React from "react";
import { render, act } from "@testing-library/react-native";
import * as Notifications from "expo-notifications";
import App, { navigationRef } from "./App"; // adjust the import path accordingly
import * as AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { strings } from "./src/res/constants/Strings";

// Mocking necessary modules
jest.mock("@react-native-async-storage/async-storage");
jest.mock("expo-notifications");
jest.mock("@react-navigation/native");
jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("<App />", () => {
  let notificationListener: any;
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    // Resetting mocks
    AsyncStorage.getItem.mockReset();
    AsyncStorage.setItem.mockReset();
    Notifications.addNotificationResponseReceivedListener.mockReset();

    // Setting up navigation mock
    mockNavigate = jest.fn();
    navigationRef.current = {
      dispatch: mockNavigate,
    };

    // Setting up Notification listener
    notificationListener = jest.fn();
    Notifications.addNotificationResponseReceivedListener.mockImplementation(
      (callback) => {
        notificationListener = callback;
        return { remove: jest.fn() } as any;
      },
    );
  });

  it("navigates to HomeHorizontal and displays the notification when a notification is received", async () => {
    const { getByText } = render(<App />);
    const fakeQuote = {
      subjects: "example subjects",
      author: "example author",
      quoteText: "example quoteText",
    };

    // Act - Simulate receiving a notification
    await act(async () => {
      notificationListener({
        notification: {
          request: {
            content: {
              data: { quote: fakeQuote },
            },
          },
        },
      } as any);
    });

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith(
      CommonActions.navigate(strings.screenName.homeHorizontal, {
        quoteSearch: {
          query: fakeQuote.subjects,
          filter: "",
        },
        currentQuotes: [fakeQuote],
        showBackButton: false,
      }),
    );

    // Add additional assertions as needed, depending on your component logic and structure.
  });
});
