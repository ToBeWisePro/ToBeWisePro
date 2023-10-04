module.exports = {
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback(null, {
        executeSql: jest.fn((_, __, successCallback) => {
          successCallback({
            rows: {
              length: 1,
              item: jest.fn(() => ({
                quoteText: "Test Quote",
                author: "Test Author",
              })),
            },
          });
        }),
      });
    }),
  })),
};
