import React from 'react';
import { render } from '@testing-library/react-native';
import { DiscoverSectionHeader, getStyles } from './DiscoverSectionHeader';
import { DARK, GRAY_3, GRAY_5 } from '../../../styles/Colors';

describe('<DiscoverSectionHeader />', () => {
  const label = 'Test Label';

  it('renders correctly', () => {
    const { getByText } = render(
      <DiscoverSectionHeader label={label} />
    );
    expect(getByText(label)).toBeTruthy();
  });

  it('displays the correct label text', () => {
    const { getByText } = render(
      <DiscoverSectionHeader label={label} />
    );
    expect(getByText(label)).toBeTruthy();
  });

  it('applies styles correctly', () => {
    const styles = getStyles(label);

    // Check text color
    expect(styles.text.color).toBe(DARK);

    // Check container styles
    expect(styles.container.backgroundColor).toBe(GRAY_5);
    expect(styles.container.borderTopColor).toBe(GRAY_3);
    expect(styles.container.borderBottomColor).toBe(GRAY_3);
  });
});
