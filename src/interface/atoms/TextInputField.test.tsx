import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInputField, TextInputSize } from './TextInputField';
import '@testing-library/jest-native/extend-expect';

describe('TextInputField component', () => {
  it('renders correctly with small size', () => {
    const { getByPlaceholderText } = render(
      <TextInputField
        placeholderText="Enter text"
        size={TextInputSize.Small}
        state=""
        setState={jest.fn()}
      />
    );
    expect(getByPlaceholderText('Enter text')).toBeDefined();
  });

  it('renders correctly with large size', () => {
    const { getByPlaceholderText } = render(
      <TextInputField
        placeholderText="Enter text"
        size={TextInputSize.Large}
        state=""
        setState={jest.fn()}
      />
    );
    expect(getByPlaceholderText('Enter text')).toBeDefined();
  });

  it('renders label if provided', () => {
    const { getByText } = render(
      <TextInputField
        placeholderText="Enter text"
        label="Test Label"
        state=""
        setState={jest.fn()}
      />
    );
    expect(getByText('Test Label')).toBeDefined();
  });

  it('updates state on text change', () => {
    const mockSetState = jest.fn();
    const { getByPlaceholderText } = render(
      <TextInputField
        placeholderText="Enter text"
        state=""
        setState={mockSetState}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Enter text'), 'new text');
    expect(mockSetState).toHaveBeenCalledWith('new text');
  });
});
