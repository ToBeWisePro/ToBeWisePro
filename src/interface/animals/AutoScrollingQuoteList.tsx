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
import { PRIMARY_BLUE } from "../../../styles/Colors"; // Corrected typo in import
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { Easing } from "react-native-reanimated";

import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";

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
  const [scrollSpeed, setScrollSpeed] = useState(0.0275);
  const [currentPosition, setCurrentPosition] = useState(0);

  const totalScrollDistance = data.length * QUOTE_ITEM_HEIGHT;

  useEffect(() => {
    if (playPressed) {
      scrollPosition.value = withTiming(totalScrollDistance, {
        duration: totalScrollDistance / scrollSpeed,
        easing: Easing.linear,
      });
    } else {
      scrollPosition.value = currentPosition;
    }
  }, [playPressed]);

  useEffect(() => {
    if (playPressed) {
      cancelAnimation(scrollPosition);
      scrollPosition.value = withTiming(totalScrollDistance, {
        duration: totalScrollDistance / scrollSpeed,
        easing: Easing.linear,
      });
    }
  }, [scrollSpeed]);

  const scrollTo = (y: number) => {
    scrollRef.current?.scrollTo({ y, animated: false });
  };

  useDerivedValue(() => {
    runOnJS(scrollTo)(scrollPosition.value);
  }, [scrollPosition]);

  const handleScroll = (event: any) => {
    setCurrentPosition(event.nativeEvent.contentOffset.y);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEventThrottle={60}
        ref={scrollRef}
        scrollEnabled={!playPressed}
        onTouchStart={() => setPlayPressed(false)}
        onScroll={handleScroll}
      >
        {data.map((quote: QuotationInterface) => (
          <SmallQuoteContainer
            key={quote._id}
            passedInQuote={quote}
            pressFunction={() => {
              let newQuotes: QuotationInterface[] = [];
              newQuotes.push(quote);
              data.forEach((quote2) => {
                if (quote._id !== quote2._id) {
                  newQuotes.push(quote2);
                }
              });
              navigation.push(strings.screenName.homeHorizontal, {
                currentQuotes: newQuotes,
                quoteSearch: {
                  filter: filter,
                  query: query,
                },
              });
            }}
          />
        ))}
      </ScrollView>
      <Slider
        minimumValue={0.005}
        maximumValue={0.05}
        onValueChange={(value) => {
          setScrollSpeed(value);
        }}
        minimumTrackTintColor={PRIMARY_BLUE}
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
