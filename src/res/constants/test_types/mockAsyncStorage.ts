// Mocking AsyncStorage
export const MockAsyncStorage = jest.mock(
  "@react-native-async-storage/async-storage",
  () => {
    return {
      getItem: jest.fn(),
      setItem: jest.fn(async () => await Promise.resolve(null)),
    };
  },
);
