import React, { useEffect, useRef, useState } from "react";
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { strings } from "../../res/constants/Strings";
import {
  FlatList,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { globalStyles } from "../../../styles/GlobalStyles";
import { SmallQuoteContainer } from "../organisms/SmallQuoteContainer";

interface Props {
  navigation: NavigationInterface;
  data: QuotationInterface[];
  filter: string;
  query: string;
  playPressed: boolean;
  setPlayPressed: (x: boolean) => void;
  scrollSpeed: number;
  offset: number;
  setOffset: (x: number) => void;
}

export const AutoScrollingQuoteList = ({
  navigation,
  data,
  filter,
  query,
  playPressed,
  setPlayPressed,
  scrollSpeed,
  offset,
  setOffset,
}: Props) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0 || 0);
  const flatListRef = useRef<FlatList<QuotationInterface>>(null);

  const scrollHandler = () => {
    if (playPressed) {
      setCurrentQuoteIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % data.length;
        if (data && nextIndex >= 0 && nextIndex < data.length) {
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0,
          });
        }
        return nextIndex;
      });
    }
    requestAnimationFrame(scrollHandler);
  };
  

  useEffect(() => {
    scrollHandler();
  }, []);

  useEffect(() => {
    // Every time the scrollPosition changes, check to see if we are on a new quote. If we are, change the quoteInEditing
    const i: number = getCurrentOffset();
    if (i != 0) {
      console.log("currentQuoteIndex before update:", currentQuoteIndex); // Add this line
      setCurrentQuoteIndex(i);
    }
  }, [offset]);

  const getCurrentOffset = () => {
    // returns the index of the current quote. If you want to increment, set incremented to true
    let currentPosition: number = parseInt(
      String(
        offset /
          (globalStyles.smallQuoteContainer.height +
            globalStyles.smallQuoteContainer.marginBottom)
      )
    );
    return currentPosition;
  };
  return (
    <View>
      <TouchableWithoutFeedback onPress={() => setPlayPressed(false)}>
        <FlatList
          ref={flatListRef}
          snapToAlignment={"start"}
          style={styles.container}
          data={data}
          contentContainerStyle={[
            { paddingTop: globalStyles.smallQuoteContainer.paddingTop },
          ]}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              setPlayPressed(false);
              flatListRef.current?.scrollToIndex({
                index: currentQuoteIndex,
                animated: true,
                viewPosition: 0,
              });
              console.log("TODO kill thread");
            });
          }}
          renderItem={(quote) => {
            return (
              <SmallQuoteContainer
                passedInQuote={quote.item}
                key={quote.item._id}
                pressFunction={() => {
                  // reorganize quotes, then set quotes
                  let newQuotes: QuotationInterface[] = [];
                  newQuotes.push(quote.item);
                  data.forEach((quote2) => {
                    if (quote.item._id != quote2._id) {
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
            );
          }}
          keyExtractor={(item) => item.quoteText}
          invertStickyHeaders={true}
          horizontal={false}
          onScroll={(ev) => {
            if (!playPressed) {
              // This stops offset from resetting if autoscroll is on
              setOffset(ev.nativeEvent.contentOffset.y);
            }
          }}
          snapToInterval={
            globalStyles.smallQuoteContainer.height +
            globalStyles.smallQuoteContainer.marginBottom
          }
          decelerationRate={0}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height:
      Dimensions.get("screen").height -
      globalStyles.navbar.height -
      globalStyles.scrollButtonBar.height,
    width: "100%",
    marginBottom: globalStyles.navbar.height * 2.5,
  },
  progressBarView: {
    height: 5,
    width: Dimensions.get("screen").width,
    alignItems: "center",
    justifyContent: "center",
  },
});
