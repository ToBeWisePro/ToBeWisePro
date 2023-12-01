import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
  type NavigationInterface,
  type QuotationInterface,
  type RouteInterface,
} from "../../res/constants/Interfaces";
import { getShuffledQuotes } from "../../backend/DBFunctions";
import { strings } from "../../res/constants/Strings";
import { AutoScrollingQuoteList } from "../animals/AutoScrollingQuoteList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../../res/constants/Enums";
import { useFocusEffect } from "@react-navigation/native";
import { TEST_IDS } from "../../res/constants/TestIDs";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const HomeVertical = ({ navigation, route }: Props): JSX.Element => {
  const [title, setTitle] = useState("");
  const [backButton, setBackButton] = useState(false);
  const [quotes, setQuotes] = useState<QuotationInterface[]>([]);
  const [playPressed, setPlayPressed] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");

  const prevQueryRef = useRef<string | null>(null);
  const prevFilterRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const getData = async (): Promise<void> => {
        const [savedQuery, savedFilter] = await Promise.all([
          AsyncStorage.getItem(ASYNC_KEYS.query),
          AsyncStorage.getItem(ASYNC_KEYS.filter),
        ]);

        setQuery(savedQuery ?? "Error setting query");
        const retrievedQuery =
          savedQuery != null && savedQuery.length > 0
            ? savedQuery
            : strings.database.defaultQuery;
        const retrievedFilter =
          savedFilter != null && savedFilter.length > 0
            ? savedFilter
            : strings.database.defaultFilter;

        if (
          prevQueryRef.current !== retrievedQuery ||
          prevFilterRef.current !== retrievedFilter
        ) {
          await getShuffledQuotes(false).then((res) => {
            setQuotes(res);
            setTitle(retrievedFilter + ": " + retrievedQuery);
            prevQueryRef.current = retrievedQuery;
            prevFilterRef.current = retrievedFilter;
          });
        }
      };
      void getData();

      try {
        setBackButton(route.params.showBackButton);
      } catch {
        setBackButton(false);
      }
    }, []),
  );

  return (
    <View style={styles.container}>
      <TopNav
        title={title}
        testID={TEST_IDS.topNav}
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
          filter={""}
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
