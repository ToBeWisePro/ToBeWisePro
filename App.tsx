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

export default function App() {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    []
  );

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
