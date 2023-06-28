// This component is used to display a button in the settings screen which has an icon and a title
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconFactory } from "../atoms/IconFactory";
import { GRAY_5, LIGHT } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";

interface Props {
  icon: string;
  title: string;
  onPress: () => void;
}

export const SettingsButton: React.FC<Props> = ({ icon, title, onPress }) => {
  switch (title) {
    case "Version Number":
      return <AppText style={{marginTop: 20, marginLeft: 10}}>ℹ️ Version Number: 7.1.35</AppText>;
    default:
      return (
        <TouchableOpacity onPress={() => onPress()} style={styles.container}>
          <View style={styles.itemContainer}>
            <IconFactory selected={false} icon={icon} />
          </View>
          <AppText>{title}</AppText>
        </TouchableOpacity>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: "100%",
    backgroundColor: LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_5,
    alignItems: "center",
    flexDirection: "row",
  },
  itemContainer: {
    marginHorizontal: 10,
  },
});
