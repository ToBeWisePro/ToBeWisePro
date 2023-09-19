// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
    const mockComponent = require('react-native/jest/mockComponent');
    return mockComponent('@react-native-community/datetimepicker');
  });
  
  import React from 'react';
  import { render, fireEvent } from '@testing-library/react-native';
  import { CustomTimeInput } from './CustomTimeInput';
  import { TEST_IDS } from '../../res/constants/TestIDS';

/*
  This test suite checks the following:
  1. If the CustomTimeInput component renders correctly.
  2. If the DateTimePicker component within CustomTimeInput has the correct mode and value.
  3. If the setTime function is called when the DateTimePicker onChange event is triggered.
*/

describe('<CustomTimeInput />', () => {
  const mockTime = new Date(2023, 8, 7, 12, 0, 0);
  const mockSetTime = jest.fn();

  it('renders correctly', () => {
    const { getByTestId } = render(<CustomTimeInput time={mockTime} setTime={mockSetTime} />);
    expect(getByTestId(TEST_IDS.dateTimePicker)).toBeTruthy();
  });

  it('has correct mode and value in DateTimePicker', () => {
    const { getByTestId } = render(<CustomTimeInput time={mockTime} setTime={mockSetTime} />);
    const picker = getByTestId(TEST_IDS.dateTimePicker);
    expect(picker.props.mode).toBe('time');
    expect(picker.props.value).toEqual(mockTime);
  });

  it('calls setTime when DateTimePicker onChange event is triggered', () => {
    const { getByTestId } = render(<CustomTimeInput time={mockTime} setTime={mockSetTime} />);
    const picker = getByTestId(TEST_IDS.dateTimePicker);
    const newTime = new Date(2023, 8, 7, 13, 0, 0);
    fireEvent(picker, 'onChange', { type: 'set' }, newTime);
    expect(mockSetTime).toHaveBeenCalledWith(newTime);
  });
});
