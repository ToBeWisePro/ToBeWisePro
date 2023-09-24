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
  const scrollPosition = useSharedValue(0);
  const [scrollSpeed, setScrollSpeed] = useState(0.0275);
  const currentPosition = useRef(0);
  const [hitBottom, setHitBottom] = useState(false);

  const totalScrollDistance = data.length * QUOTE_ITEM_HEIGHT;

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
    [filter, query, data, navigation], // Add your props here
  );

  // Function to set and store scroll speed
  const setAndStoreScrollSpeed = (
    value: React.SetStateAction<number>,
  ): void => {
    setScrollSpeed(value);
    console.log(value);
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
        console.log("firing");
        // put the user back up top
        restartScroll();
        setPlayPressed(true);
        setHitBottom(false);
      }
      scrollPosition.value = withTiming(totalScrollDistance, {
        duration: totalScrollDistance / scrollSpeed,
        easing: Easing.linear,
      });
    } else {
      scrollPosition.value = currentPosition.current;
    }
  }, [playPressed]);
  useFocusEffect(
    useCallback(() => {
      restartScroll();
      return () => {
        cancelAnimation(scrollPosition);
        scrollPosition.value = withTiming(totalScrollDistance, {
          duration: totalScrollDistance / scrollSpeed,
          easing: Easing.linear,
        });
      };
    }, [data]),
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
      // delay to allow the scroll to finish
      setTimeout(() => {
        setPlayPressed(true); // start automatic scrolling
      }, 50);
    }, 50);
  }, [setPlayPressed]);

  useDerivedValue(() => {
    runOnJS(scrollTo)(scrollPosition.value);
  }, [scrollPosition]);

  const handleScroll = (event: any): void => {
    // save event.nativeEvent.contentOffset.y as an integer
    currentPosition.current = event.nativeEvent.contentOffset.y;
  };

  const resetScrollPosition = useCallback(() => {
    restartScroll();
  }, [restartScroll]);

  const renderItem = useCallback(
    ({ item: quote }: { item: QuotationInterface }) => {
      // console.log("Rendering item", quote._id); // Add this line
      // console.log('Data length:', data.length); // New line

      return (
        <SmallQuoteContainer
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
          // set the current position
          currentPosition.current = scrollPosition.value;
        }}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: 300, paddingTop: 300 }}
        ListFooterComponent={ListFooterComponent}
        onEndReached={() => {
          setPlayPressed(false);
          setHitBottom(true);
        }}
        // onEndReachedThreshold={100}
        getItemLayout={(data, index) => ({
          length: QUOTE_ITEM_HEIGHT,
          offset: QUOTE_ITEM_HEIGHT * index,
          index,
        })}
        keyExtractor={(item) => item._id?.toString() + item.quoteText}
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
        testID={TEST_IDS.bottomNav}
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
