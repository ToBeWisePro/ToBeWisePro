import React from 'react';
import renderer from 'react-test-renderer';
import { fireEvent, render } from '@testing-library/react-native';
import { SubjectAuthorSelectorButton } from './SubjectAuthorSelectorButton';
import '@testing-library/jest-native/extend-expect';
import { PRIMARY_GREEN, GRAY_3 } from '../../../styles/Colors';
import { TEST_IDS } from '../../res/constants/TestIDS';

describe('SubjectAuthorSelectorButton component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <SubjectAuthorSelectorButton
        buttonText="Test Button"
        selected={true}
        onPress={jest.fn()}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onPress when button is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <SubjectAuthorSelectorButton
        buttonText="Test Button"
        selected={true}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('changes button background color based on selected prop', () => {
    const tree = renderer.create(
      <SubjectAuthorSelectorButton
        buttonText="Test Button"
        selected={true}
        onPress={jest.fn()}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();

    const updatedTree = renderer.create(
      <SubjectAuthorSelectorButton
        buttonText="Test Button"
        selected={false}
        onPress={jest.fn()}
      />
    ).toJSON();
    expect(updatedTree).toMatchSnapshot();
  });
});
