import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FrequencySelector from './FrequencySelector';
import { TEST_IDS } from '../../res/constants/TestIDS';
import DateTimePicker from '@react-native-community/datetimepicker';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((props) => {
      return <div testID={props.testID} onChange={() => props.onChange({}, new Date(2022, 9, 7, 12, 30))}></div>;
    }),
  };
});

/**
 * FrequencySelector Component Test
 * 
 * 1. It should render the component correctly with initial text as "Select Time".
 * 2. It should open the DateTimePicker when the "Select Time" button is pressed.
 * 3. It should call the `onTimeChange` function with null when the "Clear" button is pressed.
 * 4. It should call the `onTimeChange` function with the selected date when a time is picked.
 */

describe('<FrequencySelector />', () => {
  it('renders correctly with initial text', () => {
    const { getByText } = render(<FrequencySelector selectedTime={null} onTimeChange={jest.fn()} />);
    expect(getByText('Select Time')).toBeTruthy();
  });

  it('opens DateTimePicker when button is pressed', () => {
    const { getByText, getByTestId } = render(<FrequencySelector selectedTime={null} onTimeChange={jest.fn()} />);
    fireEvent.press(getByText('Select Time'));
    expect(getByTestId(TEST_IDS.dateTimePicker)).toBeTruthy();
  });

  it('calls onTimeChange with null when Clear button is pressed', () => {
    const mockOnTimeChange = jest.fn();
    const { getByText } = render(<FrequencySelector selectedTime={new Date()} onTimeChange={mockOnTimeChange} />);
    fireEvent.press(getByText('Clear'));
    expect(mockOnTimeChange).toHaveBeenCalledWith(null);
  });

  it('calls onTimeChange with selected date when a time is picked', () => {
    const mockOnTimeChange = jest.fn();
    const { getByText, getByTestId } = render(<FrequencySelector selectedTime={null} onTimeChange={mockOnTimeChange} />);
    fireEvent.press(getByText('Select Time'));
    // Simulate DateTimePicker onChange event with a selected date
    fireEvent(getByTestId(TEST_IDS.dateTimePicker), 'onChange', undefined, new Date(2022, 9, 7, 12, 30));
    expect(mockOnTimeChange).toHaveBeenCalledWith(new Date(2022, 9, 7, 12, 30));
  });
});
