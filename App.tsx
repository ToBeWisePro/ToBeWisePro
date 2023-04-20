import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import {
  dataImporter,
  getShuffledQuotes,
} from "./src/res/functions/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation } from "./src/res/util/RootNavigation";
import { QuotationInterface } from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Frequencies } from "./src/res/constants/Enums";

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
      await saveDefaultValue("frequency", Frequencies["1 Hour"]);
      await saveDefaultValue("notificationDB", "default"); // Update the default value for notificationDB
    })();
  }, []);

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
