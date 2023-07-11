// App.js
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import {
  dataImporter,
  getShuffledQuotes,
} from "./src/res/functions/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation, navigationRef } from "./src/res/util/RootNavigation";
import { QuotationInterface } from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./src/res/util/NotificationScheduler";
import { Image } from "react-native-elements";
import { CommonActions } from "@react-navigation/native";
import { ASYNC_KEYS } from "./src/res/constants/Enums";

export default function App() {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    []
  );
  const [frequency, setFrequency] = useState<number>(1);
  const [query, setQuery] = useState(strings.database.defaultQuery);

  const saveDefaultValue = async (key: string, value: any) => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue === null) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error saving default value:", error);
    }
  };

  useEffect(() => {
    scheduleNotifications();
    (async () => {
      const defaultStartTime = new Date();
      defaultStartTime.setHours(9, 0, 0, 0);
      const defaultEndTime = new Date();
      defaultEndTime.setHours(17, 0, 0, 0);

      await saveDefaultValue(ASYNC_KEYS.allowNotifications, true);
      await saveDefaultValue(ASYNC_KEYS.startTime, defaultStartTime);
      await saveDefaultValue(ASYNC_KEYS.endTime, defaultEndTime);
      await saveDefaultValue(
        ASYNC_KEYS.notificationQuery,
        strings.database.defaultQuery
      );
      await saveDefaultValue(ASYNC_KEYS.notificationFilter, strings.database.defaultFilter);
      await saveDefaultValue(ASYNC_KEYS.spacing, 30);

      const savedQuery = await AsyncStorage.getItem(ASYNC_KEYS.query);
      if (savedQuery !== null) {
        setQuery(savedQuery);
      }
    })();

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted.");
      }
    })();

    Notifications.addNotificationResponseReceivedListener(async (response) => {
      await AsyncStorage.setItem(
        ASYNC_KEYS.notifTitle,
        strings.copy.notificationFrom
      );
      const quote = response.notification.request.content.data.quote;
      if (quote) {
        // log if navigationref exists
        await AsyncStorage.setItem(ASYNC_KEYS.notifQuote, JSON.stringify(quote))
          .then(() => {
            const result = navigationRef.current?.dispatch(
              CommonActions.navigate(strings.screenName.homeHorizontal, {
                quoteSearch: {
                  query: quote.subjects,
                  filter: "",
                },
                currentQuotes: [quote],
                showBackButton: false,
              })
            );
          })
          .catch((error) => {
            console.log("Error saving quote:", error);
          });

        // console.log("Navigation dispatch result:", result);
      } else {
        console.log("Data from notification is not defined");
      }
    });

    // Set a default filter if none is set
    const i = async () => {
      await AsyncStorage.getItem(ASYNC_KEYS.filter).then(async (res) => {
        if (res === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.filter,
            strings.database.defaultFilter
          );
        }
      });

      // set a default subject if none is set
      await AsyncStorage.getItem(ASYNC_KEYS.query).then(async (res) => {
        if (res === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.query,
            strings.database.defaultQuery
          );
        }
      });
    };
    i();
  }, []);

  useEffect(() => {
    const i = async () => {
      // log the default query and filter
      console.log(
        "Default query: " +
          strings.database.defaultQuery +
          "\nDefault filter: " +
          strings.database.defaultFilter
      );
      await dataImporter().then(async () => {
        await getShuffledQuotes(false).then((res) => {
          setShuffledQuotes(res);
        });
      });
    };
    i().catch((error) => Alert.alert("Error", error.message));
  }, []);

  if (shuffledQuotes.length === 0) {
    console.log("Loading...");
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootNavigation
      initialRoute={"Home"}
      shuffledQuotes={shuffledQuotes}
      ref={navigationRef}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
