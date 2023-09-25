import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scheduleNotifications } from "./NotificationScheduler";

// Mocking Modules
jest.mock("expo-notifications");
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => await Promise.resolve(null)),
  setItem: jest.fn(async () => await Promise.resolve(null)),
}));

// Mocking the getShuffledQuotes function
jest.mock("../functions/DBFunctions", () => ({
  getShuffledQuotes: jest.fn(
    async () =>
      await Promise.resolve([
        {
          _id: 1,
          quoteText: "Sample Quote Text",
          author: "Sample Author",
          subjects: "Sample Subjects",
          authorLink: "http://sampleauthor.com",
          videoLink: "http://samplevideo.com",
          contributedBy: "Sample Contributor",
          favorite: false,
          deleted: false,
        },
        // ... other hardcoded quotations
      ]),
  ),
}));

describe("scheduleNotifications", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should schedule notifications within allowed time window", async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(true))
      .mockResolvedValueOnce(JSON.stringify("author"))
      .mockResolvedValueOnce(JSON.stringify(30));

    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
      undefined,
    );

    await scheduleNotifications();

    expect(Notifications.scheduleNotificationAsync).toBeCalled();

    const callArgs = (Notifications.scheduleNotificationAsync as jest.Mock).mock
      .calls;
    for (let i = 0; i < callArgs.length - 1; i++) {
      const currentTime = callArgs[i][0].trigger.date;
      const nextTime = callArgs[i + 1][0].trigger.date;
      expect(nextTime - currentTime).toBeGreaterThanOrEqual(30 * 60 * 1000);
    }
  });

  it("should handle allowNotifications being false", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(false),
    );
    await scheduleNotifications();
    expect(Notifications.scheduleNotificationAsync).not.toBeCalled();
  });
});
