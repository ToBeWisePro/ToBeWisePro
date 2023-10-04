// Import the required modules
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getShuffledQuotes } from "../functions/DBFunctions";
import * as SQLite from "expo-sqlite";
import { strings } from "../constants/Strings";

const mockExecuteSql = jest.fn();

// Mocking SQLite and AsyncStorage
const sqlResult = {
  rows: {
    length: 1,
    item: () => ({
      quoteText: "Test Quote",
      author: "Test Author",
      subjects: "Test Subjects",
      authorLink: "http://example.com/author",
      videoLink: "http://example.com/video",
      contributedBy: "Test Contributor",
      favorite: true,
      deleted: false,
    }),
  },
};

// @ts-expect-error Cannot assign to 'openDatabase' because it is a read-only property.ts(2540)
// eslint-disable-next-line no-import-assign
SQLite.openDatabase = jest.fn(() => ({
  transaction: jest.fn((transactionCallback) => {
    const tx = {
      executeSql: jest.fn((_, __, successCallback, _errorCallback) => {
        successCallback(tx, sqlResult);
        // Uncomment and use if needed:
        // errorCallback(tx, new Error('Mock error'));
      }),
    };
    transactionCallback(tx);
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(async () => await Promise.resolve(null)),
  getItem: jest.fn(async () => await Promise.resolve(null)),
}));

describe("getShuffledQuotes", () => {
  // This is essential to clear and reset mocks between test runs
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockExecuteSql.mockReset();
  });

  //   it("should always return an array", async () => {
  //     (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
  //       .mockResolvedValueOnce("Action")
  //       .mockResolvedValueOnce(strings.filters.subject);

  //     mockExecuteSql.mockImplementation(async (_, __, success) => {
  //       return await Promise.resolve(
  //         success(null, {
  //           rows: {
  //             length: 1,
  //             item: () => ({
  //               quoteText: "Test Quote",
  //               author: "Test Author",
  //               subjects: "Test Subjects",
  //               authorLink: "http://example.com/author",
  //               videoLink: "http://example.com/video",
  //               contributedBy: "Test Contributor",
  //               favorite: true,
  //               deleted: false,
  //             }),
  //           },
  //         }),
  //       );
  //     });

  //     const quotes = await getShuffledQuotes();
  //     expect(Array.isArray(quotes)).toBe(true);
  //   }, 10000);

  it.skip("should handle null values for userQuery and filter gracefully", async () => {
    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const quotes = await getShuffledQuotes();
    expect(quotes[0].quoteText).toContain("Invalid userQuery or filter");
  });

  it.skip("should handle invalid filters gracefully", async () => {
    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValueOnce("SomeUserQuery")
      .mockResolvedValueOnce("InvalidFilter");

    const quotes = await getShuffledQuotes();
    expect(quotes[0].quoteText).toContain(
      "Invalid filter provided: InvalidFilter",
    );
  });

  it.skip("should correctly fetch quotes based on userQuery and filter", async () => {
    (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>)
      .mockResolvedValueOnce("Action")
      .mockResolvedValueOnce(strings.filters.subject);

    mockExecuteSql.mockImplementation((_, __, success) => {
      success(null, {
        rows: {
          length: 1,
          item: () => ({
            quoteText: "Test Quote",
            author: "Test Author",
            subjects: "Test Subjects",
            authorLink: "http://example.com/author",
            videoLink: "http://example.com/video",
            contributedBy: "Test Contributor",
            favorite: true,
            deleted: false,
          }),
        },
      });
    });

    const quotes = await getShuffledQuotes();
    expect(quotes.length).toBeGreaterThan(0);
    expect(quotes[0]).toHaveProperty("quoteText", "Test Quote");
    expect(quotes[0]).toHaveProperty("author", "Test Author");
  });

  // You can add more test cases based on different userQuery and filter combinations
});
