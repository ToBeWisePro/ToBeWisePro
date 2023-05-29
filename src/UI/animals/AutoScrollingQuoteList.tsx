import React, { useRef, useState, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { SmallQuoteContainer } from "../organisms/SmallQuoteContainer";
import Slider from "@react-native-community/slider";
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { globalStyles } from "../../../styles/GlobalStyles";

const QUOTE_ITEM_HEIGHT = globalStyles.smallQuoteContainer.height;

interface Props {
  data: QuotationInterface[];
  playPressed: boolean;
  setPlayPressed: (value: boolean) => void;
  navigation: NavigationInterface;
  query?: string;
  filter?: (quote: QuotationInterface) => boolean;
}

export const AutoScrollingQuoteList: React.FC<Props> = ({
  data,
  playPressed,
  setPlayPressed,
  navigation,
  query,
  filter,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollPosition = useSharedValue(0);
  const [scrollSpeed, setScrollSpeed] = useState(1); // useState instead of useSharedValue
  const totalScrollDistance = data.length * QUOTE_ITEM_HEIGHT;

  useEffect(() => {
    if (playPressed) {
      console.log("Starting new animation with scrollSpeed", scrollSpeed);
      scrollPosition.value = withTiming(
        totalScrollDistance,
        {
          duration: (totalScrollDistance * 6) / scrollSpeed,
        },
        () => {
          console.log("scrollPosition after withTiming:", scrollPosition.value);
        }
      );
    } else {
      scrollPosition.value = 0; // Reset scroll position
    }
  }, [playPressed, scrollSpeed]); // Now useEffect will run when scrollSpeed changes

  const scrollTo = (y: number) => {
    scrollRef.current?.scrollTo({ y, animated: false });
  };

  useDerivedValue(() => {
    runOnJS(scrollTo)(scrollPosition.value);
  }, [scrollPosition]);

  const handlePress = (quote: QuotationInterface) => {
    // Your navigation logic here...
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        scrollEnabled={!playPressed}
        onTouchStart={() => setPlayPressed(false)}
      >
        {data.map((quote: QuotationInterface) => (
          <SmallQuoteContainer
            key={quote._id}
            passedInQuote={quote}
            pressFunction={() => handlePress(quote)}
          />
        ))}
      </ScrollView>
      <Slider
        minimumValue={0.5}
        maximumValue={3}
        onValueChange={(value) => {
          console.log("Slider adjusted, new scrollSpeed:", value);
          setScrollSpeed(value); // setScrollSpeed instead of modifying scrollSpeed.value
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flex: 1,
    marginBottom: globalStyles.navbar.height * 2,
  },
});
