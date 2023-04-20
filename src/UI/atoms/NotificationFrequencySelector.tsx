import React from "react";
import { View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { LIGHT } from "../../../styles/Colors";
import { Frequencies } from "../../res/constants/Enums";

interface Props {
  state: string;
  setState: (x: string) => void;
}

export const NotificationFrequencySelector: React.FC<Props> = ({
  state,
  setState,
}: Props) => {
  const data = Object.values(Frequencies);

  return (
    <View style={{ height: 40 }}>
      <SelectDropdown
        buttonStyle={{ backgroundColor: LIGHT, height: "100%" }}
        data={data}
        defaultButtonText={state}
        onSelect={(selectedItem, index) => {
          setState(selectedItem);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem;
        }}
        rowTextForSelection={(item, index) => {
          return item;
        }}
      />
    </View>
  );
};
