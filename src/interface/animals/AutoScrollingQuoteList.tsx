import React, { useRef, useState, useEffect, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import SmallQuoteContainer from "../organisms/SmallQuoteContainer";
import Slider from "@react-native-community/slider";
import {
  DARK,
  LIGHT,
  PRIMARY_BLUE,
  PRIMARY_GREEN,
} from "../../../styles/Colors";
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { Easing } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { AppText } from "../atoms/AppText";

const QUOTE_ITEM_HEIGHT = globalStyles.smallQuoteContainer.height;

interface Props {
  data: QuotationInterface[];
  playPressed: boolean;
  setPlayPressed: (value: boolean) => void;
  navigation: NavigationInterface;
  query: string;
  filter:string;
}

export const AutoScrollingQuoteList: React.FC<Props> = ({
  data,
  playPressed,
  setPlayPressed,
  navigation,
  query,
  filter,
}) => {
  const scrollRef = useRef<FlatList>(null);
  const scrollPosition = useSharedValue(0);
  const [scrollSpeed, setScrollSpeed] = useState(0.0275);
  const currentPosition = useRef(0);
  console.log("ASQL q/f", query, filter)

  const totalScrollDistance = data.length * QUOTE_ITEM_HEIGHT;

  const handlePress = useCallback(
    (quote: QuotationInterface) => {
      let newQuotes: QuotationInterface[] = [quote];
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
    },
    [filter, query, data, navigation] // Add your props here
  );

  // Function to set and store scroll speed
  const setAndStoreScrollSpeed = async (
    value: React.SetStateAction<number>
  ) => {
    setScrollSpeed(value);
    console.log(value);
    try {
      setScrollSpeed(value);
      await AsyncStorage.setItem("@scrollSpeed", JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const fetchScrollSpeed = async () => {
      try {
        const value = await AsyncStorage.getItem("@scrollSpeed");
        if (value !== null) {
          setScrollSpeed(JSON.parse(value));
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchScrollSpeed();
  }, []);

  useEffect(() => {
    if (playPressed) {
      scrollPosition.value = withTiming(totalScrollDistance, {
        duration: totalScrollDistance / scrollSpeed,
        easing: Easing.linear,
      });
    } else {
      scrollPosition.value = currentPosition.current;
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
    scrollRef.current?.scrollToOffset({ offset: y, animated: false });
  };

  const restartScroll = useCallback(() => {
    setPlayPressed(false);
    scrollPosition.value = 0;
    currentPosition.current = 0;
    setTimeout(() => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 500);
  }, [setPlayPressed]);

  useDerivedValue(() => {
    runOnJS(scrollTo)(scrollPosition.value);
  }, [scrollPosition]);

  const handleScroll = (event: any) => {
    // save event.nativeEvent.contentOffset.y as an integer
    currentPosition.current = event.nativeEvent.contentOffset.y;
  };

  const renderItem = useCallback(
    ({ item: quote }) => {
      // console.log("Rendering item", quote._id); // Add this line
      // console.log('Data length:', data.length); // New line

      return (
        <SmallQuoteContainer
          key={quote._id}
          passedInQuote={quote}
          pressFunction={() => handlePress(quote)}
        />
      );
    },
    [handlePress, data.length]
  );

  const ListFooterComponent = useCallback(() => {
    return data.length >= 3 ? (
      // create an AppText component with styles.buttonText that follows this format: The chosen set of NN quotations for author/subject XXXXXXX has been fully played out. For more please select *Discover* below and choose a different author/subject.
      <AppText style={styles.buttonText}>
        {"The chosen set of " +
          data.length +
          " quotations for " +
          query +
          " has been fully played out. For more please select *Discover* below and choose a different author/subject."}
      </AppText>
    ) : null;
  }, [data.length]);

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        scrollEventThrottle={16}
        ref={scrollRef}
        scrollEnabled={!playPressed}
        onTouchStart={() => {
          setPlayPressed(false);
          //set the current position
          currentPosition.current = scrollPosition.value;
        }}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: 75, paddingTop: 75 }}
        ListFooterComponent={ListFooterComponent}
        onEndReached={() => setPlayPressed(!playPressed)}
        onEndReachedThreshold={0}
        getItemLayout={(data, index) => ({
          length: QUOTE_ITEM_HEIGHT,
          offset: QUOTE_ITEM_HEIGHT * index,
          index,
        })}
        keyExtractor={(item) => item._id.toString()}
        // Optimization props
        initialNumToRender={10} // Arbitrary, you might want to adjust this number
        maxToRenderPerBatch={10} // Arbitrary, you might want to adjust this number
        windowSize={10} // Arbitrary, you might want to adjust this number
        updateCellsBatchingPeriod={5} // Arbitrary, you might want to adjust this number
        removeClippedSubviews
      />
      {data.length >= 1 ? (
        <Slider
          minimumValue={0.005}
          maximumValue={0.1}
          onValueChange={setAndStoreScrollSpeed}
          value={scrollSpeed}
          minimumTrackTintColor={PRIMARY_BLUE}
        />
      ) : (
        <AppText>
          There are currently no quotes that match your selection
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flex: 1,
    marginBottom: globalStyles.navbar.height * 2,
  },
  buttonText: {
    color: DARK,
    fontWeight: "bold",
  },
});
