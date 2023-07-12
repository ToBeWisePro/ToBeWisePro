import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
  NavigationInterface,
  QuotationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { autoScrollIntervalTime } from "../../res/constants/Values";
import { strings } from "../../res/constants/Strings";
import { AutoScrollingQuoteList } from "../animals/AutoScrollingQuoteList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSharedValue } from "react-native-reanimated";
import { ASYNC_KEYS } from "../../res/constants/Enums";
import { useFocusEffect } from "@react-navigation/native";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const HomeVertical = ({ navigation, route }: Props) => {
  const [title, setTitle] = useState("");
  const [backButton, setBackButton] = useState(false);
  const [quotes, setQuotes] = useState<QuotationInterface[]>([]);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [playPressed, setPlayPressed] = useState<boolean>(false);
  const scrollPosition = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      const getData = async () => {
        await Promise.all([
          await AsyncStorage.getItem(ASYNC_KEYS.query),
          await AsyncStorage.getItem(ASYNC_KEYS.filter),
        ]).then(async ([savedQuery, savedFilter]) => {
          const retrievedQuery = savedQuery
            ? savedQuery
            : strings.database.defaultQuery;
          const retrievedFilter = savedFilter
            ? savedFilter
            : strings.database.defaultFilter;

          console.log(
            "HomeVertical retrieved query and filter of: ",
            retrievedQuery,
            retrievedFilter
          );
          await getShuffledQuotes(false).then((res) => {
            setQuotes(res);
            setTitle(retrievedFilter + ": " + retrievedQuery);
          });
        });
      };
      getData();
      try {
        setBackButton(route.params.showBackButton);
      } catch {
        setBackButton(false);
      }
    }, [])
  );

  // console.log("Home screen re-rendered")
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
          scrollPosition={scrollPosition}
        />
      </LinearGradient>
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
    height: "100%",
  },
});
