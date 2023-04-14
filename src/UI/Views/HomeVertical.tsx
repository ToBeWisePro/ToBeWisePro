import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
  NavigationInterface,
  QuotationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { dataImporter } from "../../res/functions/DBFunctions";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { globalStyles } from "../../../styles/GlobalStyles";
import { autoScrollIntervalTime } from "../../res/constants/Values";
import { strings } from "../../res/constants/Strings";
import { AutoScrollingQuoteList } from "../animals/AutoScrollingQuoteList";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
  initialQuotes: QuotationInterface[];
}

export const HomeVertical = ({ navigation, route, initialQuotes }: Props) => {
  const [title, setTitle] = useState("");
  const [backButton, setBackButton] = useState(false);
  const [quotes, setQuotes] = useState<QuotationInterface[]>(initialQuotes);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [playPressed, setPlayPressed] = useState<boolean>(true);
  const [scrollSpeed, setScrollSpeed] = useState<number>(
    autoScrollIntervalTime
  );
  const [offset, setOffset] = useState(
    globalStyles.smallQuoteContainer.paddingTop
  );

  useEffect(() => {
    const getQuotes = async () => {
      await dataImporter().then(async () => {
        try {
          setQuotes(route.params.currentQuotes);
          setFilter(route.params.quoteSearch.filter);
          setQuery(route.params.quoteSearch.query);
          setTitle(
            route.params.quoteSearch.filter +
              ": " +
              route.params.quoteSearch.query
          );
        } catch {
          setTitle(strings.navbarHomeDefaultText);
          setQuery(strings.database.defaultQuery);
          setFilter(strings.database.defaultFilter);

          // call getShuffledQuotes() to get the default quotes and set quotes to the result
          await getShuffledQuotes(
            strings.database.defaultQuery,
            strings.database.defaultFilter
          ).then((res) => {
            setQuotes(res);
          });
        }
      });
    };

    getQuotes();
    try {
      // If there is a back button function, add in the back button
      setBackButton(route.params.showBackButton);
    } catch {
      // If there is no back button function, don't show the back button
      setBackButton(false);
    }
  }, [route]);

  return (
    <View style={styles.container}>
      <TopNav
        title={title}
        stickyHeader={true}
        backButton={backButton}
        backFunction={() => {
          navigation.goBack();
        }}
      />
      <LinearGradient
        colors={[GRADIENT_START, GRADIENT_END]}
        style={styles.background}
      >
        <AutoScrollingQuoteList
          navigation={navigation}
          data={quotes}
          filter={filter}
          query={query}
          playPressed={playPressed}
          setPlayPressed={setPlayPressed}
          scrollSpeed={scrollSpeed}
          offset={offset}
          setOffset={setOffset}
        />
      </LinearGradient>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.home}
        whatToInclude={IncludeInBottomNav.AutoScrollBar}
        playPressed={playPressed}
        setPlayPressed={setPlayPressed}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
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
  background: {
    width: "100%",
    alignItems: "center",
    height:
      Dimensions.get("window").height -
      globalStyles.navbar.height -
      globalStyles.scrollButtonBar.height -
      35,
    // backgroundColor: LIGHT,
  },
});
