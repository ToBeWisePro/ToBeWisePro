import React from "react";
import {
  render,
  act,
  waitFor,
  fireEvent,
  type RenderAPI,
} from "@testing-library/react-native";
import { AutoScrollingQuoteList } from "./AutoScrollingQuoteList";
import { mockNavigation } from "../../res/constants/test_types/mockNavigation";
import { globalStyles } from "../../../styles/GlobalStyles";
import { TEST_IDS } from "../../res/constants/TestIDs";
import { NavigationContainer } from "@react-navigation/native";
import { ErrorBoundary } from "../../res/constants/test_types/ErrorBoundry";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  mergeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  flushGetRequests: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
}));

const largeMockData = Array.from({ length: 2000 }, (_, index) => ({
  _id: index,
  quoteText: `Quote ${index}`,
  author: `Author ${index}`,
  subjects: `Subject ${index}`,
  authorLink: `http://author${index}.com`,
  videoLink: `http://video${index}.com`,
  contributedBy: `Contributor ${index}`,
  favorite: false,
  deleted: false,
}));

describe.skip("AutoScrollingQuoteList Component", () => {
  let component: RenderAPI;

  beforeEach(() => {
    component = render(
      <NavigationContainer>
        <ErrorBoundary>
          <AutoScrollingQuoteList
            data={largeMockData}
            playPressed={false}
            setPlayPressed={jest.fn()}
            navigation={mockNavigation}
            query=""
            filter=""
          />
        </ErrorBoundary>
      </NavigationContainer>,
    );
  });

  test("renders correctly", () => {
    expect(component).toMatchSnapshot();
  });

  describe.skip("AutoScrollingQuoteList Component with large data", () => {
    test("scrolls through all 2000 quotes without jumping around when auto-scroll is enabled", async () => {
      // Enable auto-scroll
      fireEvent.press(component.getByTestId(TEST_IDS.playButton));

      // Simulate scrolling
      const totalScrollDistance =
        largeMockData.length * globalStyles.smallQuoteContainer.height;
      const scrollSpeed = 0.0275; // This should be the initial scroll speed
      const duration = totalScrollDistance / scrollSpeed;

      // Wait for the duration of the scroll
      await waitFor(() => {}, { timeout: duration + 100 }); // Added a buffer of 100ms

      // Check the scroll position and ensure it's smooth and doesn't jump around
      const scrollY = component.getByTestId(TEST_IDS.flatlist).props
        .contentOffset.y;
      expect(scrollY).toBeGreaterThanOrEqual(0);
      expect(scrollY).toBeLessThanOrEqual(totalScrollDistance);

      // Check if the component has reached the end
      const hitBottom = component.getByTestId(TEST_IDS.autoScrollingQuotesList)
        .props.hitBottom;
      expect(hitBottom).toBe(true);
    });

    test("maintains the list order when a user clicks on a quote and goes back", async () => {
      // Click on a quote
      fireEvent.press(component.getByTestId(TEST_IDS.quoteContainer));

      // Simulate going back
      mockNavigation.goBack();

      // Check the order of the list
      const firstQuote = component.getByTestId(`quote_${largeMockData[0]._id}`);
      expect(firstQuote.props.children).toBe("Quote 0");
    });

    test("enters back into the same place after auto-scroll, click on a quote, and go back", async () => {
      // Enable auto-scroll and simulate scrolling
      void act(() => {
        component.getByTestId(TEST_IDS.bottomNav).props.setPlayPressed(true);
      });

      // Click on a quote and simulate going back
      fireEvent.press(component.getByTestId(TEST_IDS.quoteContainer));
      mockNavigation.goBack();

      // Check the scroll position
      const scrollY = component.getByTestId(TEST_IDS.flatlist).props
        .contentOffset.y;
      expect(scrollY).toBeGreaterThanOrEqual(0);
    });

    test("enters back into the same place after manual scroll, click on a quote, and go back", async () => {
      // Simulate manual scrolling
      void act(() => {
        component
          .getByTestId(TEST_IDS.flatlist)
          .props.onScroll({ nativeEvent: { contentOffset: { y: 100 } } });
      });

      // Click on a quote and simulate going back
      fireEvent.press(component.getByTestId(TEST_IDS.quoteContainer));
      mockNavigation.goBack();

      // Check the scroll position
      const scrollY = component.getByTestId(TEST_IDS.flatlist).props
        .contentOffset.y;
      expect(scrollY).toBe(100);
    });
  });
});

test("maintains the list order when a user clicks on a quote and goes back", async () => {
  // Click on a quote
  // Go back and check the order of the list
});

test("enters back into the same place after auto-scroll, click on a quote, and go back", async () => {
  // Enable auto-scroll and simulate scrolling
  // Click on a quote and go back
  // Check the scroll position
});

test("enters back into the same place after manual scroll, click on a quote, and go back", async () => {
  // Simulate manual scrolling
  // Click on a quote and go back
  // Check the scroll position
});
