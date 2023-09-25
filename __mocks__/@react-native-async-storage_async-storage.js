// __mocks__/@react-native-async-storage_async-storage.js
module.exports = {
  setItem: jest.fn(async () => await Promise.resolve(null)),
  getItem: jest.fn(async () => await Promise.resolve(null)),
};
