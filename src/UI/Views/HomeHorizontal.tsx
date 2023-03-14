import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import { QuotationInterface, RouteInterface } from "../../res/constants/Interfaces";
import { SubjectBubble } from "../molecules/SubjectBubble";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { LargeQuoteContainer } from "../organisms/LargeQuoteContainer";

interface Props {
  navigation: {
    push: (ev: string, {}) => void;
    goBack: () => void;
  };
  route: RouteInterface;
}

export const HomeHorizontal = ({ navigation, route }: Props) => {
  const [title, setTitle] = useState("");
  const [quotes, setQuotes] = useState<QuotationInterface[]>(route.params.currentQuotes);
  const [offset, setOffset] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);
  const [playPressed, setPlayPressed] = useState<boolean>(false);

  const flatListRef = useRef<FlatList<QuotationInterface>>(null);

  const getCurrentOffset = (incremented: boolean) => {
    // returns the index of the current quote. If you want to increment, set incremented to true
    let currentPosition: number = parseInt(
      String(offset / globalStyles.largeQuoteContainer.width)
    );
    if (incremented) {
      currentPosition +=
        globalStyles.largeQuoteContainer.width +
        globalStyles.largeQuoteContainer.marginLeft;
    }
    return currentPosition;
  };

  useEffect(() => {
    // Initialize quotes, then set our current quote as the first quote
    setQuotes(route.params.currentQuotes);
  }, []);

  useEffect(() => {
    // Every time the query changes, update the title.
    // setQuotes(route.params.currentQuotes);
    setTitle(
      route.params.quoteSearch.filter + ": " + route.params.quoteSearch.query
    );
  }, [route]);
  useEffect(() => {
    // Every time the scrollPosition changes, check to see if we are on a new quote. If we are, change the quoteInEditing
    const i: number = getCurrentOffset(false);
    if (i != 0) {
      // console.log("BLOCKED offset useEffect setting quote to ", quotes[i].quoteText)
      // setCurrentQuoteIndex(quotes[i]);
      setCurrentQuoteIndex(i);
    }
  }, [offset]);

  return (
    <View style={styles.container}>
      <TopNav
        title={title}
        stickyHeader={true}
        backButton={true}
        backFunction={() => {
          navigation.goBack();
        }}
      />
      <LinearGradient
        colors={[GRADIENT_START, GRADIENT_END]}
        style={styles.background}
      >
        <View>
          <ScrollView horizontal={true} style={styles.subjectScrollView}>
            {quotes[currentQuoteIndex]?.subjects.split(",").map((tag) => {
              return (
                <SubjectBubble
                  key={tag}
                  subject={tag}
                  navigation={navigation}
                />
              );
            })}
          </ScrollView>
          <TouchableWithoutFeedback
            onPress={() => {
              setPlayPressed(false);
            }}
          >
            <FlatList
              // flatListRef={React.createRef()}
              ref={flatListRef}
              data={quotes}
              horizontal={true}
              snapToAlignment={"center"}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise((resolve) => setTimeout(resolve, 500));
                wait.then(() => {
                  console.log("Scroll to index failed");
                  setPlayPressed(false);
                  flatListRef.current?.scrollToIndex({
                    index: currentQuoteIndex,
                    animated: true,
                    viewPosition: 0,
                  });
                });
              }}
              onScroll={(ev) => {
                if (!playPressed) {
                  // This stops offset from resetting if autoscroll is on
                  setOffset(ev.nativeEvent.contentOffset.x);
                }
              }}
              contentContainerStyle={{ paddingTop: 10 }}
              snapToInterval={
                globalStyles.largeQuoteContainer.width +
                globalStyles.largeQuoteContainer.marginLeft
              }
              decelerationRate={0}
              style={styles.flatListStyle}
              renderItem={(quote) => {
                return (
                  <LargeQuoteContainer
                    passedInQuote={quote.item}
                    key={quote.item._id}
                    navigation={navigation}
                  />
                );
              }}
              keyExtractor={(item) => item.quoteText}
            />
          </TouchableWithoutFeedback>
        </View>
      </LinearGradient>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.home}
        whatToInclude={IncludeInBottomNav.PlayButton}
        setPlayPressed={()=> navigation.push(strings.screenName.home, {})}
        playPressed={playPressed}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "#000",
  },
  flatListStyle: {
    height: Dimensions.get("window").height - globalStyles.navbar.height - 150,
    marginBottom: globalStyles.navbar.height * 2.5,
  },
  background: {
    width: "100%",
    height: "100%",
  },
  subjectScrollView: {
    height: 40,
    marginTop: 10,
  },
});
