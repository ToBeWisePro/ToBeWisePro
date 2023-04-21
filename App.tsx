import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import {
  dataImporter,
  getShuffledQuotes,
} from "./src/res/functions/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation } from "./src/res/util/RootNavigation";
import { QuotationInterface } from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';

export default function App() {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    []
  );

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
    (async () => {
      const defaultStartTime = new Date();
      defaultStartTime.setHours(9, 0, 0, 0);
      const defaultEndTime = new Date();
      defaultEndTime.setHours(17, 0, 0, 0);
  
      await saveDefaultValue("allowNotifications", true);
      await saveDefaultValue("startTime", defaultStartTime);
      await saveDefaultValue("endTime", defaultEndTime);
      await saveDefaultValue("frequency", 5);
      await saveDefaultValue("notificationDB", "default"); // Update the default value for notificationDB
    })();

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted.");
      }
    })();
  }, []);

  useEffect(() => {
    const i = async () => {
      await dataImporter().then(async () =>
        getShuffledQuotes(
          strings.database.defaultQuery,
          strings.database.defaultFilter
        ).then((res) => {
          setShuffledQuotes(res);
        })
      );
    };
    i();
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
