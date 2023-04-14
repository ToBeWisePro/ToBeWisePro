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

export default function App() {
  const [fontReady, setFontReady] = useState(false);
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    []
  );

  useEffect(() => {
    getShuffledQuotes(
      strings.database.defaultFilter,
      strings.database.defaultKey
    ).then((res) => {
      setShuffledQuotes(res);
    });
  }, []);

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
