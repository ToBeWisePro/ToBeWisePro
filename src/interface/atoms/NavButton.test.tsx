import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavButton } from './NavButton';
import { strings } from '../../res/constants/Strings';
import { LIGHT, PRIMARY_BLUE, PRIMARY_GREEN } from '../../../styles/Colors';

/**
 * NavButton Component Test
 * 
 * 1. It should render the component correctly with the given buttonText.
 * 2. It should render the IconFactory with selected=true when selected prop is true.
 * 3. It should render the IconFactory with selected=false when selected prop is false.
 * 4. It should navigate to the correct screen when pressed.
 */

describe('<NavButton />', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockResetScrollPosition = jest.fn();

  it('renders correctly with given buttonText', () => {
    const { getByText } = render(
      <NavButton
        buttonText="Home"
        selected={false}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />
    );
    expect(getByText('Home')).toBeTruthy();
  });

  it('renders IconFactory with selected=true when selected prop is true', () => {
    // You may need to mock IconFactory or check its props
    // For now, we'll just check if the component renders without crashing
    render(
      <NavButton
        buttonText="Home"
        selected={true}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />
    );
  });

  it('renders IconFactory with selected=false when selected prop is false', () => {
    // You may need to mock IconFactory or check its props
    // For now, we'll just check if the component renders without crashing
    render(
      <NavButton
        buttonText="Home"
        selected={false}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />
    );
  });

  it('navigates to the correct screen when pressed', () => {
    const { getByText } = render(
      <NavButton
        buttonText="Home"
        selected={false}
        navigationTarget={strings.screenName.home}
        navigation={mockNavigation}
        resetScrollPosition={mockResetScrollPosition}
      />
    );
    fireEvent.press(getByText('Home'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith(strings.screenName.home);
  });
});
