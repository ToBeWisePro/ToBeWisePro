import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { DiscoverTile } from './DiscoverTile';
import '@testing-library/jest-native/extend-expect';
import { getQuoteCount } from '../../res/functions/DBFunctions';

// Mocking AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve(null)),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

// Mocking DBFunctions
jest.mock('../../res/functions/DBFunctions', () => ({
  getQuoteCount: jest.fn(() => Promise.resolve(10)),
}));

const mockNavigation = {
  navigate: jest.fn(),
};

const mockOnPress = jest.fn();

describe('DiscoverTile component', () => {
  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title and count', async () => {
    // Mocking the getQuoteCount function to return 10
    (getQuoteCount as jest.Mock).mockResolvedValue(10);

    const { getByText, unmount } = render(
      <DiscoverTile
        query="Test Query"
        navigation={mockNavigation}
        filter="Test Filter"
      />
    );

    // Waiting for the component to render and checking the text
    await waitFor(() => {
      expect(getByText('Test Query')).toBeDefined();
      expect(getByText(' (10)')).toBeDefined();
    });

    // Unmounting the component
    unmount();
  });

  it('does not call onPress when count is zero', async () => {
    // Mocking the getQuoteCount function to return 0
    (getQuoteCount as jest.Mock).mockResolvedValue(0);

    const { getByText, unmount } = render(
      <DiscoverTile
        query="Test Query"
        navigation={mockNavigation}
        filter="Test Filter"
        onPress={mockOnPress}
      />
    );

    // Waiting for the component to render and checking the text
    await waitFor(() => {
      expect(getByText('Test Query')).toBeDefined();
      expect(getByText(' (0)')).toBeDefined();
    });

    // Simulating a press event
    fireEvent.press(getByText('Test Query'));

    // Checking that mockOnPress has not been called
    await waitFor(() => {
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    // Unmounting the component
    unmount();
  });
});
