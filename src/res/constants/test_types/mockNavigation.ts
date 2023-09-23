import { type NavigationInterface } from "../Interfaces";

export const mockNavigation: NavigationInterface = {
  navigate: jest.fn(),
  push: jest.fn(),
  goBack: jest.fn(),
  addListener: undefined,
};
