// App.js
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import {
  dataImporter,
  getShuffledQuotes,
} from "./src/res/functions/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation } from "./src/res/util/RootNavigation";
import { QuotationInterface } from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./src/res/util/NotificationScheduler";
import { Image } from "react-native-elements";

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

      await saveDefaultValue("allowNotifications", true);
      await saveDefaultValue("startTime", defaultStartTime);
      await saveDefaultValue("endTime", defaultEndTime);
      await saveDefaultValue("frequency", 5);
      await saveDefaultValue("notificationDB", "default");

      const savedFrequency = await AsyncStorage.getItem("frequency");
      if (savedFrequency !== null) {
        setFrequency(Number(savedFrequency));
      }

      const savedQuery = await AsyncStorage.getItem("query");
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

    // Added this part
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const data = response.notification.request.content.data.quote;
      if (data) {
        navigation.navigate("HomeVertical", { quote: data });
      }
    });

    // Set a default filter if none is set
    AsyncStorage.getItem("filter").then((res) => {
      if (res === null) {
        AsyncStorage.setItem("filter", strings.database.defaultFilter);
      }
    });

    // set a default subject if none is set
    AsyncStorage.getItem("subject").then((res) => {
      if (res === null) {
        AsyncStorage.setItem("subject", strings.database.defaultSubject);
      }
    });
    // FIXME what are the implications of this?
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
      await dataImporter().then(async () =>
        getShuffledQuotes(
          strings.database.defaultQuery,
          strings.database.defaultFilter
        ).then((res) => {
          setShuffledQuotes(res);
        })
      );
    };
    i()
      .catch((error) => Alert.alert("Error", error.message));
  }, []);

  if (shuffledQuotes.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootNavigation initialRoute={"Home"} shuffledQuotes={shuffledQuotes} />
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
