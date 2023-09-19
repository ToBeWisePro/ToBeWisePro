// AppText.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native';
import { AppText } from './AppText';

describe('<AppText />', () => {
  it('renders correctly', () => {
    const { getByText } = render(<AppText>Test Text</AppText>);
    expect(getByText('Test Text')).toBeTruthy();
  });

  it('applies maxFontSizeMultiplier prop', () => {
    const { getByText } = render(<AppText maxFontSizeMultiplier={2}>Test Text</AppText>);
    expect(getByText('Test Text').props.maxFontSizeMultiplier).toBe(2);
  });

  it('handles onPress event', () => {
    const mockOnPress = jest.fn((ev: NativeSyntheticEvent<NativeTouchEvent>) => {});
    const { getByText } = render(<AppText onPress={mockOnPress}>Test Text</AppText>);
    fireEvent.press(getByText('Test Text'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('applies style prop', () => {
    const { getByText } = render(<AppText style={{ color: 'red' }}>Test Text</AppText>);
    expect(getByText('Test Text').props.style).toMatchObject({ color: 'red' });
  });

  it('applies numberOfLines prop', () => {
    const { getByText } = render(<AppText numberOfLines={1}>Test Text</AppText>);
    expect(getByText('Test Text').props.numberOfLines).toBe(1);
  });
});
