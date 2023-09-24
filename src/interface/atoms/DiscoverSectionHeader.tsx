import React from "react";
import { View, type ViewStyle, type TextStyle } from "react-native";
import { DARK, GRAY_3, GRAY_5 } from "../../../styles/Colors";
import { AppText } from "./AppText";

interface Props {
  label: string;
}

interface Styles {
  container: ViewStyle;
  text: Record<string, unknown> & TextStyle;
}

export const getStyles = (label: string): Styles => ({
  container: {
    height: 30,
    width: "100%",
    backgroundColor: GRAY_5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: GRAY_3,
    borderBottomColor: GRAY_3,
    justifyContent: "center",
  },
  text: {
    marginLeft: 10,
    color: DARK,
  },
});

export const DiscoverSectionHeader = ({ label }: Props): JSX.Element => {
  const styles = getStyles(label);
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>{label}</AppText>
    </View>
  );
};
