import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
  NavigationInterface,
  QuotationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { SubjectBubble } from "../molecules/SubjectBubble";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { LargeQuoteContainer } from "../organisms/LargeQuoteContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlatList } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { ASYNC_KEYS } from "../../res/constants/Enums";
import { useFocusEffect } from "@react-navigation/native";
interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const HomeHorizontal = ({ navigation, route }: Props) => {
  const [title, setTitle] = useState("");
  const [firstQuote, setFirstQuote] = useState<QuotationInterface | undefined>(
    route.params.currentQuotes ? route.params.currentQuotes[0] : undefined
  );
  const [backButton, showBackButton] = useState(true);

  // set the title and firstQuote (which was passed to us via route). Also determine whether or not there should be a back button
  useFocusEffect(
    useCallback(() => {
      const getData = async () => {
        console.log("HomeHorizontal: firing");
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
          } else {
            const retrievedQuery = savedQuery
              ? savedQuery
              : strings.database.defaultQuery;
            const retrievedFilter = savedFilter
              ? savedFilter
              : strings.database.defaultFilter;
            setTitle(retrievedFilter + ": " + retrievedQuery);
            console.log("Using route.params to set quote");
            setFirstQuote(route.params.currentQuotes[0]);
          }
        });
      };

      getData();
      return () => {
        AsyncStorage.removeItem(ASYNC_KEYS.notifTitle);
        AsyncStorage.removeItem(ASYNC_KEYS.notifQuote);
        console.log("HomeHorizontal: clearing");
      };
    }, [navigation, route])
  );

  // Set title from AsyncStorage or from route params
  // Set title from AsyncStorage or from route params
  useEffect(() => {}, []);

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
        <FlatList
          data={firstQuote?.subjects.split(",")}
          horizontal={true}
          style={styles.flastList}
          renderItem={({ item }) => (
            <SubjectBubble key={item} subject={item} navigation={navigation} />
          )}
        />
        <View style={styles.quoteContainer}>
          <LargeQuoteContainer
            passedInQuote={firstQuote}
            navigation={navigation}
            route={route}
          />
        </View>
      </LinearGradient>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.home}
        whatToInclude={IncludeInBottomNav.PlayButton}
        setPlayPressed={() => {
          navigation.navigate(strings.screenName.home);
        }}
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
