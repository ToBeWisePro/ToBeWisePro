import { convertDateTo24h } from "./BackwardsCompatability"; // adjust the import path accordingly
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("convertDateTo24h", () => {
  beforeEach(() => {
    // Clear mock calls before every test
    mockedAsyncStorage.getItem.mockReset();
    mockedAsyncStorage.setItem.mockReset();
  });

  it("should convert stored date value to 24h format and save it", async () => {
    const key = "startTime24h";
    const defaultValue = 900;
    const date = new Date();
    date.setHours(15); // 3:00 PM
    date.setMinutes(30); // 15:30 -> 1530 in 24h format

    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify(date.toString()),
    );

    await convertDateTo24h(key, defaultValue);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(1530),
    );
  });

  it('should handle invalid JSON value "u" gracefully', async () => {
    const key = "startTime24h";
    const defaultValue = 900;
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    mockedAsyncStorage.getItem.mockResolvedValue("u");

    await convertDateTo24h(key, defaultValue);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error converting date to 24h format:",
      expect.any(SyntaxError),
    );

    // Check that AsyncStorage.setItem was not called with invalid data
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(key, "u");

    // Restore console.error to its original state
    consoleErrorSpy.mockRestore();
  });

  it("should set the default value if no value is stored", async () => {
    const key = "startTime24h";
    const defaultValue = 900;

    mockedAsyncStorage.getItem.mockResolvedValue(null);

    await convertDateTo24h(key, defaultValue);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(defaultValue),
    );
  });

  it("should not alter value if it is already in number format", async () => {
    const key = "startTime24h";
    const defaultValue = 900;

    mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(defaultValue));

    await convertDateTo24h(key, defaultValue);

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("should log error if JSON parsing fails", async () => {
    const key = "startTime24h";
    const defaultValue = 900;
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    mockedAsyncStorage.getItem.mockResolvedValue("invalid JSON");

    await convertDateTo24h(key, defaultValue);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error converting date to 24h format:",
      expect.any(SyntaxError),
    );

    // Restore console.error to its original state
    consoleErrorSpy.mockRestore();
  });
});
