import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { TopNav } from "../molecules/TopNav";
import LinearGradient from "react-native-linear-gradient";
import { GRADIENT_START, GRADIENT_END } from "../../../styles/Colors";
import {
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
import { SETTINGS_KEYS } from "./NotificationsScreen";
import { useAsyncStorage } from "@react-native-community/hooks"; // Import this

interface Props {
  navigation: {
    push: (ev: string, {}) => void;
    goBack: () => void;
  };
  route: RouteInterface;
}

export const HomeHorizontal = ({ navigation, route }: Props) => {
  const [title, setTitle] = useState("");
  const [firstQuote, setFirstQuote] = useState<QuotationInterface | undefined>(
    route.params.currentQuotes ? route.params.currentQuotes[0] : undefined
  );

  // Set title from AsyncStorage or from route params
  useEffect(() => {
    AsyncStorage.getItem("filter").then((filter) => {
      AsyncStorage.getItem("query").then((query) => {
        if (filter && query) {
          AsyncStorage.getItem(SETTINGS_KEYS.notifTitle).then((notifTitle) => {
            if (notifTitle && notifTitle !== title && notifTitle.length > 0) {
              setTitle(notifTitle);
              AsyncStorage.setItem(SETTINGS_KEYS.notifTitle, "");
            } else if (title === "") {
              setTitle(
                route.params.quoteSearch.filter +
                  ": " +
                  route.params.quoteSearch.query
              );
            } else {
              setTitle(filter + ": " + query);
            }
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const quote = response.notification.request.content.data.quote;
        if (quote) {
          setFirstQuote(quote);
          AsyncStorage.getItem(SETTINGS_KEYS.notifTitle).then((notifTitle) => {
            if (notifTitle && notifTitle !== title) {
              setTitle(notifTitle);
              AsyncStorage.setItem(SETTINGS_KEYS.notifTitle, "");
            }
          });
        }
      }
    );

    return () => subscription.remove();
  }, []);
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
        setPlayPressed={() =>
          navigation.push(strings.screenName.home, {
            currentQuotes: [firstQuote],
          })
        }
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
