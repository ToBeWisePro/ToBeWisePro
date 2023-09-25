import React, { useRef, useState, useEffect, useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  useSharedValue,
  withTiming,
  useDerivedValue,
  runOnJS,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import SmallQuoteContainer from "../organisms/SmallQuoteContainer";
import Slider from "@react-native-community/slider";
import { DARK, PRIMARY_BLUE } from "../../../styles/Colors";
import {
  type NavigationInterface,
  type QuotationInterface,
} from "../../res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { AppText } from "../atoms/AppText";
import { BottomNav } from "../organisms/BottomNav";
import { ASYNC_KEYS, IncludeInBottomNav } from "../../res/constants/Enums";
import { useFocusEffect } from "@react-navigation/native";
import { TEST_IDS } from "../../res/constants/TestIDs";

const QUOTE_ITEM_HEIGHT = globalStyles.smallQuoteContainer.height;

interface Props {
  data: QuotationInterface[];
  playPressed: boolean;
  setPlayPressed: (value: boolean) => void;
  navigation: NavigationInterface;
  query: string;
  filter: string;
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
  const initialDataOrder = useRef(data);
  const initialDataOrderRef = useRef<QuotationInterface[]>([]);
  const prevDataRef = useRef<QuotationInterface[]>(data); // to store the previous data

  const scrollPosition = useSharedValue(0);
  const [scrollSpeed, setScrollSpeed] = useState(0.0275);
  const currentPosition = useRef(0);
  const [hitBottom, setHitBottom] = useState(false);
  const totalScrollDistance =
    data.length * QUOTE_ITEM_HEIGHT +
    (data.length * globalStyles.navbar.height + 38);

  const areArraysEquivalent = (
    arr1: QuotationInterface[],
    arr2: QuotationInterface[],
  ): boolean => {
    if (arr1.length !== arr2.length) return false;

    const sortedArr1 = [...arr1].sort((a, b) =>
      (a._id ?? "") > (b._id ?? "") ? 1 : -1,
    );
    const sortedArr2 = [...arr2].sort((a, b) =>
      (a._id ?? "") > (b._id ?? "") ? 1 : -1,
    );

    return sortedArr1.every((val, index) => val._id === sortedArr2[index]._id);
  };

  if (initialDataOrderRef.current.length === 0) {
    initialDataOrderRef.current = data;
  }
  useEffect(() => {
    // If data prop has changed
    if (!areArraysEquivalent(prevDataRef.current, data)) {
      // Update the initialDataOrderRef with the new data
      initialDataOrderRef.current = data;
      // Update the prevDataRef with the new data for the next comparison
      prevDataRef.current = data;
      const timerId = setTimeout(() => {
        scrollRef.current?.scrollToIndex({ index: 0, animated: false });
      }, 0); // Timeout set to ensure the scrollToIndex is called after rendering

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [data]);

  const handlePress = useCallback(
    (quote: QuotationInterface) => {
      const newQuotes: QuotationInterface[] = [quote];
      data.forEach((quote2) => {
        if (quote._id !== quote2._id) {
          newQuotes.push(quote2);
        }
      });
      navigation.push(strings.screenName.homeHorizontal, {
        currentQuotes: newQuotes,
        quoteSearch: {
          filter,
          query,
        },
      });
    },
    [filter, query, data, navigation],
  );

  useEffect(() => {
    // Update the ref value if the data prop changes
    initialDataOrder.current = data;
  }, [data]);

  const setAndStoreScrollSpeed = (
    value: React.SetStateAction<number>,
  ): void => {
    setScrollSpeed(value);
    AsyncStorage.setItem(ASYNC_KEYS.scrollSpeed, JSON.stringify(value)).catch(
      (e) => {
        console.log(e);
      },
    );
  };

  useEffect(() => {
    const fetchScrollSpeed = async (): Promise<void> => {
      try {
        const value = await AsyncStorage.getItem(ASYNC_KEYS.scrollSpeed);
        if (value !== null) {
          setScrollSpeed(JSON.parse(value));
        }
      } catch (e) {
        console.log(e);
      }
    };
    void fetchScrollSpeed();
  }, []);

  useEffect(() => {
    if (playPressed) {
      if (hitBottom) {
        restartScroll();
        setPlayPressed(true);
        setHitBottom(false);
      } else {
        // Calculate the remaining distance from the current position
        const remainingDistance = totalScrollDistance - currentPosition.current;

        // Set the scrollPosition value to the current position before starting the animation
        scrollPosition.value = currentPosition.current;

        // Start the animation from the current position
        scrollPosition.value = withTiming(totalScrollDistance, {
          duration: remainingDistance / scrollSpeed,
          easing: Easing.linear,
        });
      }
    } else {
      cancelAnimation(scrollPosition);
      // When play is paused, set scrollPosition.value to the current position.
      scrollPosition.value = currentPosition.current;
    }
  }, [playPressed, hitBottom]);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollToOffset({
        offset: currentPosition.current,
        animated: false,
      });
      return () => {
        if (playPressed) {
          cancelAnimation(scrollPosition);
          scrollPosition.value = withTiming(totalScrollDistance, {
            duration: totalScrollDistance / scrollSpeed,
            easing: Easing.linear,
          });
        }
      };
    }, [data, playPressed]),
  );

  useEffect(() => {
    if (playPressed) {
      cancelAnimation(scrollPosition);
      scrollPosition.value = withTiming(totalScrollDistance, {
        duration: totalScrollDistance / scrollSpeed,
        easing: Easing.linear,
      });
    }
  }, [scrollSpeed]);

  const scrollTo = (y: number): void => {
    scrollRef.current?.scrollToOffset({ offset: y, animated: false });
  };

  const restartScroll = useCallback(() => {
    setPlayPressed(false);
    scrollPosition.value = 0;
    currentPosition.current = 0;
    setTimeout(() => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
      setTimeout(() => {
        setPlayPressed(true);
      }, 50);
    }, 50);
  }, [setPlayPressed]);

  useDerivedValue(() => {
    runOnJS(scrollTo)(scrollPosition.value);
  }, [scrollPosition]);

  const handleScroll = (event: any): void => {
    currentPosition.current = event.nativeEvent.contentOffset.y;
  };

  const resetScrollPosition = useCallback(() => {
    restartScroll();
  }, [restartScroll]);

  const renderItem = useCallback(
    ({ item: quote }: { item: QuotationInterface }) => {
      return (
        <SmallQuoteContainer
          testID={TEST_IDS.quoteContainer}
          key={quote._id}
          passedInQuote={quote}
          pressFunction={() => {
            handlePress(quote);
          }}
        />
      );
    },
    [handlePress, data.length],
  );

  const ListFooterComponent = useCallback(() => {
    return data.length >= 3 ? (
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
    <View style={styles.container} testID={TEST_IDS.autoScrollingQuotesList}>
      <FlatList
        testID={TEST_IDS.flatlist}
        data={initialDataOrderRef.current}
        renderItem={renderItem}
        scrollEventThrottle={16}
        ref={scrollRef}
        scrollEnabled={!playPressed}
        onTouchStart={() => {
          setPlayPressed(false);
          currentPosition.current = scrollPosition.value;
        }}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: 300, paddingTop: 300 }}
        ListFooterComponent={ListFooterComponent}
        onEndReached={() => {
          setPlayPressed(false);
          setHitBottom(true);
        }}
        getItemLayout={(data, index) => ({
          length: QUOTE_ITEM_HEIGHT,
          offset: QUOTE_ITEM_HEIGHT * index,
          index,
        })}
        keyExtractor={(item) => item._id?.toString() + item.quoteText}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={5}
        removeClippedSubviews
      />
      {data.length >= 1 ? (
        <Slider
          minimumValue={0.005}
          style={{ marginBottom: 180, marginHorizontal: 20 }}
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
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.home}
        whatToInclude={IncludeInBottomNav.PlayButton}
        playPressed={playPressed}
        setPlayPressed={setPlayPressed}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
        resetScrollPosition={resetScrollPosition}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    flex: 1,
    marginBottom: globalStyles.navbar.height + 38,
    width: "100%",
  },
  buttonText: {
    color: DARK,
    fontWeight: "bold",
    width: 370,
    alignSelf: "center",
  },
});
