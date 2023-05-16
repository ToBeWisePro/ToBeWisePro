import React, { useEffect, useRef, useState } from "react";
import { FlatList, Slider, StyleSheet, View } from "react-native";
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { SmallQuoteContainer } from "../organisms/SmallQuoteContainer";
import { globalStyles } from "../../../styles/GlobalStyles";
import { SliderPicker } from "react-native-slider-picker";
import { PRIMARY_GREEN } from "../../../styles/Colors";
import { strings } from "../../res/constants/Strings";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [scrollInterval, setScrollInterval] = useState<any>(null);
  const scrollOffset = useRef(0); // create a mutable reference

  const handlePlayPress = () => {
    setPlayPressed(!playPressed);
  };

  useEffect(() => {
    if (playPressed) {
      if (scrollInterval) clearInterval(scrollInterval);
      const newInterval = setInterval(() => {
        scrollOffset.current += 1; // use the current property of the ref
        if (
          scrollOffset.current >=
          globalStyles.smallQuoteContainer.height * data.length
        ) {
          clearInterval(newInterval);
          setPlayPressed(false);
          scrollOffset.current = 0; // use the current property of the ref
        } else {
          flatListRef.current?.scrollToOffset({
            offset: scrollOffset.current, // use the current property of the ref
            animated: false,
          });
        }
      }, scrollSpeed);
      setScrollInterval(newInterval);
    } else if (scrollInterval) {
      clearInterval(scrollInterval);
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [playPressed, data.length, scrollSpeed]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={(quote) => {
          return (
            <SmallQuoteContainer
              passedInQuote={quote.item}
              key={quote.item._id}
              pressFunction={() => {
                // reorganize quotes, then set quotes
                let newQuotes: QuotationInterface[] = [];
                newQuotes.push(quote.item);
                data.forEach((quote2: QuotationInterface) => {
                  if (quote.item._id !== quote2._id) {
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
        getItemLayout={(data, index) => ({
          length: globalStyles.smallQuoteContainer.height,
          offset: globalStyles.smallQuoteContainer.height * index,
          index,
        })}
        onScrollToIndexFailed={(error) => {
          console.error(error);
          setPlayPressed(false);
        }}
        onScrollBeginDrag={() => {
          handlePlayPress();
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      <View style={{ height: 0 }}>
        <SliderPicker
          maxValue={0}
          minValue={500}
          inverted={true}
          callback={(value: React.SetStateAction<number>) =>
            setScrollSpeed(value)
          }
          defaultValue={10}
          showNumberScale={false}
          fillColor={PRIMARY_GREEN}
          backgroundColor={"#fff"}
          // labelFontWeight={'bold'}
          // showNumberScale={true}
          // showSeparatorScale={true}
          // buttonBackgroundColor={'#fff'}
          // buttonBorderColor={"#6c7682"}
          buttonBorderWidth={1}
          // scaleNumberFontWeight={'300'}
          buttonDimensionsPercentage={6}
          heightPercentage={1}
          widthPercentage={80}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    marginBottom: globalStyles.navbar.height * 2.5,
  },
});
