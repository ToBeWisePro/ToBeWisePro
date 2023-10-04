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
      void scheduleNotifications();
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Notification permissions not granted.");
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      await AsyncStorage.getItem(ASYNC_KEYS.filter).then(async (res) => {
        if (res === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.filter,
            strings.database.defaultFilter,
          );
        }
      });
      await AsyncStorage.getItem(ASYNC_KEYS.query).then(async (res) => {
        if (res === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.query,
            strings.database.defaultQuery,
          );
        }
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await dataImporter().then(async () => {
        await getShuffledQuotes(false).then((res) => {
          setShuffledQuotes(res);
        });
      });
    })().catch((error) => {
      Alert.alert("Error", error.message);
    });
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
