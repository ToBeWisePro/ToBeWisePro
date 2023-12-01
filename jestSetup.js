// jestSetup.js

// Global mock for AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => {
  return require("@react-native-async-storage/async-storage/jest/async-storage-mock");
});

// Mock for @react-native-firebase/firestore
jest.mock("@react-native-firebase/firestore", () => {
  // Mock Firestore document
  const docData = {
    author: "Mary Wilson Little",
    authorLink: "https://www.google.com/search?q=Mary Wilson Little",
    contributedBy: "",
    createdAt: "1",
    quoteText:
      "There is no pleasure in having nothing to do; the fun is in having lots to do and not doing it.",
    subjects: ["Priority", "Balance", "Decision", "Freedom"],
    videoLink:
      "https://www.google.com/search?tbm=vid&hl=en&as_epq=&as_oq=&as_eq=&lr=lang_en&dur=&as_qdr=all&as_sitesearch=www.ted.com%2Ftalks&safe=active&tbs=&as_q=Priority,",
  };

  return {
    collection: jest.fn((path) => ({
      get: jest.fn(
        async () => await Promise.resolve([{ id: "1", data: () => docData }]),
      ),
      doc: jest.fn((id) => ({
        get: jest.fn(
          async () => await Promise.resolve({ id, data: () => docData }),
        ),
        set: jest.fn(async () => {
          await Promise.resolve();
        }),
        // Add other async methods as needed
      })),
      // Add other collection methods as needed
    })),
    // Add other Firestore properties and methods as needed
  };
});

// Any other global setup can be added here
