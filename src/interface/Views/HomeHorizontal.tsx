import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
  type NavigationInterface,
  type QuotationInterface,
  type RouteInterface,
} from "../../res/constants/Interfaces";
import { SubjectBubble } from "../molecules/SubjectBubble";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav, ASYNC_KEYS } from "../../res/constants/Enums";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { LargeQuoteContainer } from "../organisms/LargeQuoteContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlatList } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { TEST_IDS } from "../../res/constants/TestIDs";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const HomeHorizontal = ({ navigation, route }: Props): JSX.Element => {
  const [title, setTitle] = useState("");
  const [firstQuote, setFirstQuote] = useState<QuotationInterface | undefined>(
    route.params.currentQuotes[0],
  );
  const [backButton, showBackButton] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const getData = async (): Promise<void> => {
        await Promise.all([
          await AsyncStorage.getItem(ASYNC_KEYS.query),
          await AsyncStorage.getItem(ASYNC_KEYS.filter),
          await AsyncStorage.getItem(ASYNC_KEYS.notifTitle),
          await AsyncStorage.getItem(ASYNC_KEYS.notifQuote),
        ]).then(async ([savedQuery, savedFilter, notifTitle, notifQuote]) => {
          if (notifTitle !== null && notifQuote !== null) {
            setTitle(notifTitle);
            showBackButton(false);
            setFirstQuote(JSON.parse(notifQuote));

            // Reset the notification data after using it
            await AsyncStorage.removeItem(ASYNC_KEYS.notifTitle);
            await AsyncStorage.removeItem(ASYNC_KEYS.notifQuote);
          } else {
            const retrievedQuery = savedQuery ?? strings.database.defaultQuery;
            const retrievedFilter =
              savedFilter ?? strings.database.defaultFilter;
            setTitle(retrievedFilter + ": " + retrievedQuery);
            setFirstQuote(route.params.currentQuotes[0]);
          }
        });
      };

      void getData();
    }, [navigation, route]),
  );

  return (
    <View style={styles.container}>
      <TopNav
        testID={TEST_IDS.topNav}
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
        <FlatList
          data={firstQuote?.subjects.split(",")}
          horizontal={true}
          style={styles.flastList}
          renderItem={({ item }) => (
            <SubjectBubble key={item} subject={item} navigation={navigation} />
          )}
        />
        <View style={styles.quoteContainer}>
          {firstQuote != null && (
            <LargeQuoteContainer
              passedInQuote={firstQuote}
              navigation={navigation}
            />
          )}
        </View>
      </LinearGradient>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.home}
        whatToInclude={IncludeInBottomNav.PlayButton}
        setPlayPressed={() => {
          navigation.navigate(strings.screenName.home);
        }}
        playPressed={false}
        scrollSpeed={0}
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
    height: "100%",
    paddingTop: 30,
  },
  quoteContainer: {
    alignItems: "center",
    height:
      Dimensions.get("window").height - 40 - globalStyles.navbar.height - 300,
    alignContent: "flex-start",
  },
  flastList: {
    height: 40,
    flexGrow: 0,
  },
});
