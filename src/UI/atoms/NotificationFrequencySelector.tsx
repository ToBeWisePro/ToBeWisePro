import React from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LIGHT } from "../../../styles/Colors";

interface Props {
  state: number;
  setState: (x: number) => void;
}

export const NotificationFrequencySelector: React.FC<Props> = ({
  state,
  setState,
}: Props) => {
  const data = Array.from({ length: 20 }, (_, i) => i + 1).map((item) => ({
    label: item.toString(),
    value: item,
  }));

  return (
    <View style={{ height: 60, position: "relative" }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <DropDownPicker
          items={data}
          defaultValue={state}
          containerStyle={{ height: "100%" }}
          style={{ backgroundColor: LIGHT }}
          itemStyle={{
            justifyContent: "flex-start",
          }}
          dropDownStyle={{ backgroundColor: LIGHT }}
          onChangeItem={(item) => setState(item.value)}
        />
      </View>
    </View>
  );
};
