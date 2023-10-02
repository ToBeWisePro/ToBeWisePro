import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./NotificationScheduler";
import { getShuffledQuotes } from "../functions/DBFunctions";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-notifications");
jest.mock("../functions/DBFunctions"); // Mock the DBFunctions module.

describe("scheduleNotifications", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should handle null values from AsyncStorage gracefully", async () => {
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockResolvedValue(null);
    await scheduleNotifications();
    expect(JSON.parse).not.toHaveBeenCalled();
  });

  it("should not schedule notifications when there are no quotes", async () => {
    (
      getShuffledQuotes as jest.MockedFunction<typeof getShuffledQuotes>
    ).mockResolvedValueOnce([]);
    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("should handle errors gracefully and log them", async () => {
    console.error = jest.fn();
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockRejectedValue(new Error("AsyncStorage Error"));
    await scheduleNotifications();
    expect(console.error).toHaveBeenCalledWith(
      "Error loading allowNotifications setting:",
      expect.any(Error),
    );
  });

  it("should not schedule notifications when quote text is empty", async () => {
    (
      getShuffledQuotes as jest.MockedFunction<typeof getShuffledQuotes>
    ).mockResolvedValueOnce([{ quoteText: "", author: "author 1" }]);
    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("should schedule notifications correctly when all conditions are met", async () => {
    const mockQuotes = [
      { quoteText: "quote 1", author: "author 1" },
      { quoteText: "quote 2", author: "author 2" },
    ];
    (
      getShuffledQuotes as jest.MockedFunction<typeof getShuffledQuotes>
    ).mockResolvedValueOnce(mockQuotes);
    (
      Notifications.scheduleNotificationAsync as jest.MockedFunction<
        typeof Notifications.scheduleNotificationAsync
      >
    ).mockResolvedValue("notificationId");

    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(
      mockQuotes.length,
    );
  });

  it("should handle invalid user queries and filters gracefully in getShuffledQuotes", async () => {
    (
      getShuffledQuotes as jest.MockedFunction<typeof getShuffledQuotes>
    ).mockImplementationOnce(() => {
      throw new Error("Invalid userQuery or filter");
    });
    console.error = jest.fn();

    await scheduleNotifications();
    expect(console.error).toHaveBeenCalledWith(
      "Error during getShuffledQuotes",
      expect.any(Error),
    );
  });
});
