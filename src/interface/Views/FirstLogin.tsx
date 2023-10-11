import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, FlatList, Share } from "react-native";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { strings } from "../../res/constants/Strings";
import { TopNav } from "../molecules/TopNav";
import { GRAY_6 } from "../../../styles/Colors";
import { openLink } from "../../res/functions/UtilFunctions";
import { SettingsButton } from "../molecules/SettingsButton";
import { TEST_IDS } from "../../res/constants/TestIDs";
import { type NavigationInterface } from "../../res/constants/Interfaces";
import Rate, { AndroidMarket } from "react-native-rate";
import { AppText } from "../atoms/AppText";

interface Props {
  navigation: NavigationInterface;
}

interface Button {
  icon: string;
  title: string;
  onPress: () => void; // Changed to void as we are wrapping async functions
}

export const FirstLogin = ({ navigation }: Props): JSX.Element => {
  useEffect(() => {
    console.debug("FirstLogin hit");
  }, []);
  return (
    <View style={styles.container}>
      <AppText>FirstLogin</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get("window").height,
    backgroundColor: "#f0f",
  },
  buttonList: {
    backgroundColor: GRAY_6,
    height: "100%",
  },
});
