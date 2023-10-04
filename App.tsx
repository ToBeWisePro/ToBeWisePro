import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import {
  dataImporter,
  getShuffledQuotes,
} from "./src/res/functions/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation } from "./src/res/util/RootNavigation";
import { type QuotationInterface } from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./src/res/util/NotificationScheduler";
import { ASYNC_KEYS } from "./src/res/constants/Enums";
import { convertDateTo24h } from "./src/res/util/BackwardsCompatability";
import { type NavigationContainerRef } from "@react-navigation/native";

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export default function App(): JSX.Element {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        await saveDefaultValue(ASYNC_KEYS.allowNotifications, true);
        await convertDateTo24h(ASYNC_KEYS.startTime24h, 900);
        await convertDateTo24h(ASYNC_KEYS.endTime24h, 1700);
        await saveDefaultValue(
          ASYNC_KEYS.notificationQuery,
          strings.database.defaultQuery,
        );
        await saveDefaultValue(
          ASYNC_KEYS.notificationFilter,
          strings.database.defaultFilter,
        );
        await saveDefaultValue(ASYNC_KEYS.spacing, 30);
        await scheduleNotifications();
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.error("Notification permissions not granted.");
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const filter = await AsyncStorage.getItem(ASYNC_KEYS.filter);
        if (filter === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.filter,
            strings.database.defaultFilter,
          );
        }
        const query = await AsyncStorage.getItem(ASYNC_KEYS.query);
        if (query === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.query,
            strings.database.defaultQuery,
          );
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await dataImporter();
        const quotes = await getShuffledQuotes(false);
        setShuffledQuotes(quotes);
      } catch (error) {
        // @ts-expect-error Type 'string' is not assignable to type 'never'.
        Alert.alert("Error", error.message);
      }
    })();
  }, []);

  const saveDefaultValue = async (key: string, value: any): Promise<void> => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue === null) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error saving default value:", error);
    }
  };

  if (shuffledQuotes.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <RootNavigation initialRoute={"Home"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
