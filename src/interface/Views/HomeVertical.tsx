import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import { NavigationInterface, QuotationInterface, RouteInterface } from "../../res/constants/Interfaces";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { globalStyles } from "../../../styles/GlobalStyles";
import { autoScrollIntervalTime } from "../../res/constants/Values";
import { strings } from "../../res/constants/Strings";
import  {AutoScrollingQuoteList} from "../animals/AutoScrollingQuoteList";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
  initialQuotes: QuotationInterface[];
  initialRoute?: boolean;
}

export const HomeVertical = ({ navigation, route, initialQuotes, initialRoute }: Props) => { 
  const [title, setTitle] = useState("");
  const [backButton, setBackButton] = useState(false);
  const [quotes, setQuotes] = useState<QuotationInterface[]>(initialQuotes);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [playPressed, setPlayPressed] = useState<boolean>(true);
  const [scrollSpeed, setScrollSpeed] = useState<number>(autoScrollIntervalTime);

  useEffect(() => {
    const fetchQueryAndFilter = async (filter, query) => {
      setFilter(filter);
      setQuery(query);
      await AsyncStorage.setItem('userQuery', query);
      await AsyncStorage.setItem('userFilter', filter);
    }

    const fetchFromStorageAndSet = async (defaultQuery, defaultFilter) => {
      const savedFilter = await AsyncStorage.getItem('userFilter') || defaultFilter;
      const savedQuery = await AsyncStorage.getItem('userQuery') || defaultQuery;
      setFilter(savedFilter);
      setQuery(savedQuery);
      const res = await getShuffledQuotes(savedQuery, savedFilter);
      setQuotes(res);
    }

    const defaultQuery = strings.database.defaultQuery;
    const defaultFilter = strings.database.defaultFilter;
    const quoteSearch = route.params?.quoteSearch;

    if (quoteSearch) {
      const {query, filter} = quoteSearch;
      try {
        setQuotes(route.params.currentQuotes);
        fetchQueryAndFilter(filter, query);
        setTitle(filter + ": " + query);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        fetchFromStorageAndSet(defaultQuery, defaultFilter);
        setTitle(defaultFilter + ": " + defaultQuery);
      } catch (error) {
        setTitle(strings.navbarHomeDefaultText);
      }
    }

    try {
      setBackButton(route.params.showBackButton);
    } catch {
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
          data={quotes}
          playPressed={playPressed}
          setPlayPressed={setPlayPressed}
          navigation={navigation}
          query={query}
          filter={filter}
          />
      </LinearGradient>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.home}
        whatToInclude={IncludeInBottomNav.PlayButton}
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
  },
});
