import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
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
import * as Font from "expo-font";

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export default function App(): JSX.Element {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [message, setMessage] = useState("");

  const loadFonts = async (): Promise<void> => {
    try {
      setMessage("Loading fonts...");
      await Font.loadAsync({
        TimesNewRoman: require("./assets/fonts/times_new_roman.ttf"),
      });
      setFontsLoaded(true);
      setMessage("Fonts loaded.");
    } catch (error) {
      setMessage(`Font loading error: ${(error as Error).message}`);
    }
  };

  const saveDefaultValue = async (key: string, value: any): Promise<void> => {
    try {
      setMessage(`Setting default value for ${key}...`);
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue === null) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
      setMessage(`Default value for ${key} set.`);
    } catch (error) {
      setMessage(
        `Error setting default value for ${key}: ${(error as Error).message}`,
      );
    }
  };

  const initializeEssentials = async (): Promise<void> => {
    try {
      setMessage("Initializing essentials...");
      await loadFonts();
      const isFirstLogin = await AsyncStorage.getItem(
        ASYNC_KEYS.firstTimeLogin,
      );
      if (isFirstLogin === null || JSON.parse(isFirstLogin) === true) {
        // set Async key isFirstLogin to false
        setMessage("Initializing database...");
        await initDB();
        setMessage("Database initialized.");
        await backgroundOperations();
      }
      setMessage("Setting query and filter");

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
      setMessage("Fetching shuffled quotes...");
      const quotes = await getShuffledQuotes(false);
      setShuffledQuotes(quotes);

      setIsLoading(false);
      setMessage("Shuffled quotes fetched.");
      if (isFirstLogin == null || JSON.parse(isFirstLogin) === true) {
        await backgroundOperations(); // Running background operations asynchronously if not the first time
      }
    } catch (error) {
      setMessage(`Essential initialization error: ${(error as Error).message}`);
    }
    void AsyncStorage.setItem(ASYNC_KEYS.firstTimeLogin, JSON.stringify(false));
  };

  const backgroundOperations = async (): Promise<void> => {
    try {
      setMessage("Running background operations...");
      if (getApps().length === 0) {
        setMessage("Initializing Firebase...");
        initializeApp(firebaseConfig);
        setMessage("Firebase initialized.");
      }
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
      setMessage("Scheduling notifications...");
      await scheduleNotifications();
      setMessage("Notifications scheduled.");
      void Notifications.requestPermissionsAsync();
      setMessage("Background operations completing..");
    } catch (error) {
      setMessage(`Background operations error: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    void initializeEssentials();
  }, []);

  if (!fontsLoaded || isLoading || shuffledQuotes.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>{message}</Text>
      </View>
    );
  }
  return <RootNavigation initialRoute={strings.screenName.home} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
