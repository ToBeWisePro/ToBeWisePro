// The purpose of this code is to create a selector which is used in the Settings screen to say how frequently notifications should be sent
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
  const data = [
    Frequencies[0],
    Frequencies[1],
    Frequencies[2],
    Frequencies[3],
    Frequencies[4],
    Frequencies[5],
  ];

  return (
    <View style={{ height: 40 }} >
      <SelectDropdown
      buttonStyle={{backgroundColor: LIGHT, height: "100%"}}
        data={data}
        onSelect={(selectedItem, index) => {
          console.log(selectedItem, index);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          // text represented after item is selected
          // if data array is an array of objects then return selectedItem.property to render after item is selected
          return selectedItem;
        }}
        rowTextForSelection={(item, index) => {
          // text represented for each item in dropdown
          // if data array is an array of objects then return item.property to represent item in dropdown
          return item;
        }}
      />
    </View>
  );
};
