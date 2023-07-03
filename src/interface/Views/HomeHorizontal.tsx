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

  // function to update title
  const updateTitle = (filter: string, query: string) => {
    setTitle(filter + ": " + query);
  };

  // Set title from AsyncStorage if it's not set yet
  useEffect(() => {
    if (title === "") {
      AsyncStorage.getItem("filter").then((filter) => {
        AsyncStorage.getItem("query").then((query) => {
          if (filter && query) updateTitle(filter, query);
        });
      });
    }
  }, [title]);

  // Set title based on notification
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const quote = response.notification.request.content.data.quote;
        if (quote) {
          // Set the quote from the notification as the first item
          setFirstQuote(quote);
          setTitle(strings.copy.notificationFrom + quote.author);
        }
      }
    );

    // Don't forget to unsubscribe when the component is unmounted
    return () => subscription.remove();
  }, []);

  // Set default title if it's not set yet
  useEffect(() => {
    if (title === "") {
      setTitle(
        route.params.quoteSearch.filter + ": " + route.params.quoteSearch.query
      );
    }
  }, [title, route.params.quoteSearch.filter, route.params.quoteSearch.query]);

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
