import React from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { GRAY_3, LIGHT, PRIMARY_GREEN} from "../../../styles/Colors";

interface Props {
  buttonText: string;
  selected: boolean;
  onPress: ()=>void
}

export const DataButton: React.FC<Props> = ({
  buttonText,
  selected,
  onPress
}: Props) => {
  return (
    <TouchableWithoutFeedback
      style={[
        styles.container,
        { backgroundColor: selected ? PRIMARY_GREEN : GRAY_3 },
      ]}
      onPress={onPress}
    >
      {selected ? (
        <View>
          <AppText style={styles.selected}>{buttonText}</AppText>
        </View>
      ) : (
        <View>
          <AppText style={styles.deselected}>{buttonText}</AppText>
        </View>
      )}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex:1,
    justifyContent: "center",
    alignItems: "center",
    height: 32,
    width: 108,
    borderRadius: 5
  },
  selected: {
    color: LIGHT,
  },
  deselected: {
    color: LIGHT
  }
});
