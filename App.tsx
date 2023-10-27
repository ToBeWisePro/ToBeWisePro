import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { getShuffledQuotes, initDB } from "./src/backend/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation } from "./src/res/util/RootNavigation";
import { type QuotationInterface } from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./src/res/util/NotificationScheduler";
import { ASYNC_KEYS } from "./src/res/constants/Enums";
import { convertDateTo24h } from "./src/res/util/BackwardsCompatability";
import { type NavigationContainerRef } from "@react-navigation/native";
import { getApps, initializeApp } from "@firebase/app";
import { firebaseConfig } from "./src/backend/FirebaseConfig";

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export default function App(): JSX.Element {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    [],
  );
  const [firstLogin, setFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the default app is initialized, if not initialize it
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await saveDefaultValue(ASYNC_KEYS.allowNotifications, true);
        await saveDefaultValue(ASYNC_KEYS.firstTimeLogin, true);
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
        // Make sure this comes after all values have been set up
        await scheduleNotifications();

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.error("Notification permissions not granted.");
        }

        const isFirstLogin = await AsyncStorage.getItem(
          ASYNC_KEYS.firstTimeLogin,
        );
        if (isFirstLogin === null || JSON.parse(isFirstLogin) === true) {
          setFirstLogin(true);
        }
        setIsLoading(false);
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
        await initDB();
        const quotes = await getShuffledQuotes(false);
        setShuffledQuotes(quotes);
      } catch (error) {
        // @ts-expect-error 'error' is of type unknown
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

  if (isLoading || shuffledQuotes.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initialRoute = firstLogin
    ? strings.screenName.firstLogin
    : strings.screenName.home;
  return <RootNavigation initialRoute={initialRoute} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
