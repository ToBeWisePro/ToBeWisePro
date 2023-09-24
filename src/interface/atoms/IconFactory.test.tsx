import "@testing-library/jest-native/extend-expect";
import React from "react";
import { render } from "@testing-library/react-native";
import { DARK, LIGHT, PRIMARY_BLUE } from "../../../styles/Colors"; // Adjust the import based on your actual file structure
import { IconFactory } from "./IconFactory";

describe("<IconFactory />", () => {
  it("renders icon with LIGHT color when selected is true", async () => {
    const { findAllByTestId } = render(
      <IconFactory icon="home" selected={true} />,
    );
    const icons = await findAllByTestId("icon-home-selected");
    expect(icons).not.toBeNull(); // Ensure icons are found
    const icon = icons.find((i) => i.props.color === LIGHT);
    expect(icon).not.toBeNull(); // Ensure icon with LIGHT color is found
  });

  it("renders icon with DARK color when selected is false and no color prop is provided", async () => {
    const { findAllByTestId } = render(
      <IconFactory icon="home" selected={false} />,
    );
    const icons = await findAllByTestId("icon-home-unselected");
    expect(icons).not.toBeNull(); // Ensure icons are found
    const icon = icons.find((i) => i.props.color === DARK);
    expect(icon).not.toBeNull(); // Ensure icon with DARK color is found
  });

  it("renders icon with provided color prop when selected is false", async () => {
    const { findAllByTestId } = render(
      <IconFactory icon="home" selected={false} color={PRIMARY_BLUE} />,
    );
    const icons = await findAllByTestId("icon-home-unselected");
    expect(icons).not.toBeNull(); // Ensure icons are found
    const icon = icons.find((i) => i.props.color === PRIMARY_BLUE);
    expect(icon).not.toBeNull(); // Ensure icon with PRIMARY_BLUE color is found
  });
});
