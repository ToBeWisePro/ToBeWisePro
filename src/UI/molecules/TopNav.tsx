import React from "react";
import {View, StyleSheet, TouchableOpacity} from "react-native";
import {
  LIGHT,
  GRAY_4,
  PRIMARY_BLUE,
} from "../../../styles/Colors";
import Constants from "expo-constants";
import { AppText } from "../atoms/AppText";
import { IconFactory } from "../atoms/IconFactory";
import { globalStyles } from "../../../styles/GlobalStyles";

interface Props {
  title: string;
  stickyHeader: boolean;
  backButton: boolean;
  backFunction?: () => void;
}

export const TopNav: React.FC<Props> = ({
  title,
  stickyHeader,
  backButton,
  backFunction,
}: Props) => {
  return (
    <View
      style={[styles.topNavBarRoot, stickyHeader && styles.topNavBarSticky]}
    >
      <View>
        {backButton && (
          <TouchableOpacity
            onPress={backFunction}
            style={styles.backButton}
          >
            <IconFactory icon={"arrow-back-ios"} selected={true} />
          </TouchableOpacity>
        )}
      </View>

      <AppText
        style={[styles.titleText, backButton ? { marginLeft: -50 } : {}]}
      >
        {title}
      </AppText>
      <View></View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNavBarRoot: {
    borderBottomWidth: 1,
    backgroundColor: PRIMARY_BLUE,
    borderBottomColor: GRAY_4,
    height: globalStyles.navbar.topHeight,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
    position: "relative",
    padding: 10,
    // flex: 1
  },
  backButton: {
    position: "relative",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    // flexBasis:"50%"
  },

  topNavBarSticky: {
    marginTop: Constants.statusBarHeight,
    alignItems: "center",
  },
  titleText: {
    color: LIGHT,
    fontSize: 20,
    fontWeight: '700',
    // flex: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
