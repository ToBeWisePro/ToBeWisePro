//FIXME I can't figure out how to test the colors for IconFactory
// Import the jest-native extend-expect at the top of your test file
import '@testing-library/jest-native/extend-expect';

// Your existing imports
import React from 'react';
import { render } from '@testing-library/react-native';
import { DARK, LIGHT, PRIMARY_BLUE } from '../../../styles/Colors'; // Adjust the import based on your actual file structure
import { IconFactory } from './IconFactory';

// Your test suite
describe('<IconFactory />', () => {
  xit('renders icon with LIGHT color when selected is true', async () => {
    const { debug, findAllByTestId } = render(<IconFactory icon="home" selected={true} />);
    debug(); // Output the entire rendered component tree
    const icons = await findAllByTestId('icon-home-selected');
    console.log("Found icons? ", icons.length > 0);
    // log all icons
    icons.forEach(icon => {
        //print the icon and the color
        console.log("Icon: ", icon.props.testID);
        console.log("Color: ", icon.props.styles.color);
    });
    const icon = icons.find(i => i.props.color); // Assuming color is the prop you want to check
    expect(icon.props.color).toBe(LIGHT);
  });

  xit('renders icon with DARK color when selected is false and no color prop is provided', async () => {
    const { debug, findAllByTestId } = render(<IconFactory icon="home" selected={false} />);
    debug(); // Output the entire rendered component tree
    const icons = await findAllByTestId('icon-home-unselected');
    const icon = icons.find(i => i.props.color); // Assuming color is the prop you want to check
    expect(icon.props.color).toBe(DARK);
  });

  xit('renders icon with provided color prop when selected is false', async () => {
    const { debug, findAllByTestId } = render(<IconFactory icon="home" selected={false} color={PRIMARY_BLUE} />);
    debug(); // Output the entire rendered component tree
    const icons = await findAllByTestId('icon-home-unselected');
    const icon = icons.find(i => i.props.color); // Assuming color is the prop you want to check
    expect(icon.props.color).toBe(PRIMARY_BLUE);
  });
});
