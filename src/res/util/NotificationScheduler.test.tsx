import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./NotificationScheduler";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { type QuotationInterface } from "../constants/Interfaces";

// Mock required for AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
jest.mock("expo-notifications");

const mockQuotes: QuotationInterface[] = [];
for (let i = 1; i <= 5; i++) {
  mockQuotes.push({
    _id: i,
    quoteText: `Mock Quote Text ${i}`,
    author: `Mock Author ${i}`,
    subjects: `Mock Subject ${i}`,
    authorLink: `https://author-link-${i}.com`,
    videoLink: `https://video-link-${i}.com`,
    contributedBy: "TestUser",
    favorite: i % 2 === 0,
    deleted: false,
  });
}

jest.mock("../functions/DBFunctions", () => ({
  getShuffledQuotes: jest.fn().mockResolvedValue(mockQuotes),
}));

describe("scheduleNotifications", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should handle null values from AsyncStorage gracefully", async () => {
    (
      AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>
    ).mockResolvedValue(null);
    await scheduleNotifications();
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
    ).mockResolvedValueOnce(
      mockQuotes.map((quote) => ({ ...quote, quoteText: "" })),
    );
    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it.skip("should schedule notifications correctly when all conditions are met", async () => {
    (
      Notifications.scheduleNotificationAsync as jest.MockedFunction<
        typeof Notifications.scheduleNotificationAsync
      >
    ).mockResolvedValue("notificationId");
    await scheduleNotifications("Action", "Subjects");
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
