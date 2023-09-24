// This component is used on the Discover screen to display a clickable subject bubble
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { type NavigationInterface } from "../../res/constants/Interfaces";
import { strings } from "../../res/constants/Strings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../../res/constants/Enums";

interface Props {
  subject: string;
  navigation: NavigationInterface;
}

export const SubjectBubble: React.FC<Props> = ({
  subject,
  navigation,
}: Props) => {
  const handlePress = (): void => {
    void (async () => {
      await AsyncStorage.setItem(ASYNC_KEYS.query, subject);
      await AsyncStorage.setItem(ASYNC_KEYS.filter, strings.filters.subject);
      navigation.navigate(strings.screenName.home);
    })();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <AppText style={styles.textStyle}>{subject}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 7,
    backgroundColor: PRIMARY_BLUE,
    paddingLeft: 10,
    paddingRight: 10,
    height: 30,
    alignContent: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  textStyle: {
    color: LIGHT,
  },
});
