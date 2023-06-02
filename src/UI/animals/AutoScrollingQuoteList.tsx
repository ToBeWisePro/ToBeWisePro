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
  const [scrollSpeed, setScrollSpeed] = useState(1);

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
      console.log("Resetting scroll position");
      scrollPosition.value = 0;
    }
  }, [playPressed]);

  useEffect(() => {
    if (playPressed) {
      console.log("Adjusting animation due to scrollSpeed change", scrollSpeed);
      cancelAnimation(scrollPosition);
      const remainingDistance = totalScrollDistance - scrollPosition.value;
      const newDuration = (remainingDistance * 6) / scrollSpeed;
      console.log(
        "Remaining distance:",
        remainingDistance,
        "New duration:",
        newDuration
      );
      scrollPosition.value = withTiming(
        totalScrollDistance,
        {
          duration: newDuration,
        },
        () => {
          console.log("scrollPosition after adjusting:", scrollPosition.value);
        }
      );
    }
  }, [scrollSpeed]);

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
          setScrollSpeed(value);
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
