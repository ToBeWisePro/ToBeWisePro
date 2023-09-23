import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
  type NavigationInterface,
  type QuotationInterface,
  type RouteInterface,
} from "../../res/constants/Interfaces";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { strings } from "../../res/constants/Strings";
import { AutoScrollingQuoteList } from "../animals/AutoScrollingQuoteList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../../res/constants/Enums";
import { useFocusEffect } from "@react-navigation/native";
import { TEST_IDS } from "../../res/constants/TestIDS";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const HomeVertical = ({ navigation, route }: Props): JSX.Element => {
  const [title, setTitle] = useState("");
  const [backButton, setBackButton] = useState(false);
  const [quotes, setQuotes] = useState<QuotationInterface[]>([]);
  const [playPressed, setPlayPressed] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      const getData = async (): Promise<void> => {
        await Promise.all([
          AsyncStorage.getItem(ASYNC_KEYS.query),
          AsyncStorage.getItem(ASYNC_KEYS.filter),
        ]).then(async ([savedQuery, savedFilter]) => {
          const retrievedQuery =
            savedQuery != null && savedQuery.length > 0
              ? savedQuery
              : strings.database.defaultQuery;
          const retrievedFilter =
            savedFilter != null && savedFilter.length > 0
              ? savedFilter
              : strings.database.defaultFilter;
          await getShuffledQuotes(false).then((res) => {
            setQuotes(res);
            setTitle(retrievedFilter + ": " + retrievedQuery);
          });
        });
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
          // TODO remove unused imports in ASQL
          query={""}
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
