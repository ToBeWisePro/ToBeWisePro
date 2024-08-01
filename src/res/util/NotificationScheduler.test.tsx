import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./NotificationScheduler";
import { getShuffledQuotes } from "../../backend/DBFunctions";
import { type QuotationInterface } from "../constants/Interfaces";
import { ASYNC_KEYS } from "../constants/Enums";

// Mock required for AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
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

jest.mock("../../backend/DBFunctions.tsx", () => ({
  getShuffledQuotes: jest.fn().mockResolvedValue(mockQuotes),
}));

describe("scheduleNotifications", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    console.error = jest.fn();
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key === ASYNC_KEYS.allowNotifications) {
          return await Promise.resolve(JSON.stringify(true));
        }
        return await Promise.resolve(null);
      },
    );
  });

  it("should handle null values from AsyncStorage gracefully", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    await scheduleNotifications();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should not schedule notifications when there are no quotes", async () => {
    (getShuffledQuotes as jest.Mock).mockResolvedValueOnce([]);
    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  // it("should handle errors gracefully and log them", async () => {
  //   (AsyncStorage.getItem as jest.Mock).mockImplementation(
  //     async (key: string) => {
  //       if (key === ASYNC_KEYS.allowNotifications) {
  //         return await Promise.resolve(JSON.stringify(true));
  //       }
  //       return await Promise.reject(new Error("AsyncStorage Error"));
  //     },
  //   );
  //   await scheduleNotifications();
  //   expect(console.error).toHaveBeenCalledWith(
  //     "Error loading start and end times:",
  //     expect.any(Error),
  //   );
  // });

  it("should handle invalid JSON for allowNotifications", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      async (key: string) => {
        if (key === ASYNC_KEYS.allowNotifications) {
          return await Promise.resolve("invalid json");
        }
        return await Promise.resolve(null);
      },
    );
    await scheduleNotifications();
    expect(console.error).toHaveBeenCalledWith(
      "Error loading allowNotifications setting:",
      expect.any(Error),
    );
  });

  it("should not schedule notifications when quote text is empty", async () => {
    (getShuffledQuotes as jest.Mock).mockResolvedValueOnce(
      mockQuotes.map((quote) => ({ ...quote, quoteText: "" })),
    );
    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("should handle invalid user queries and filters gracefully in getShuffledQuotes", async () => {
    (getShuffledQuotes as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Invalid userQuery or filter");
    });
    await scheduleNotifications();
    expect(console.error).toHaveBeenCalledWith(
      "Error during getShuffledQuotes",
      expect.any(Error),
    );
  });
});
