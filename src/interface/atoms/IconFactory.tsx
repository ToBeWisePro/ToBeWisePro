import React from "react";
import { View } from "react-native";
import { Icon } from "react-native-elements";
import { DARK, LIGHT } from "../../../styles/Colors";

interface Props {
  icon: string;
  selected: boolean;
  color?: string;
}

export const IconFactory: React.FC<Props> = ({ icon, selected, color }: Props) => {
  const size = 25;
  const tvParallaxProperties = { undefined };
  const testID = selected ? `icon-${icon}-selected` : `icon-${icon}-unselected`;
  
  return (
    <View>
      {selected ? (
        <Icon
          name={icon}
          color={LIGHT}
          size={size}
          testID={testID}
          //@ts-ignore
          tvParallaxProperties={tvParallaxProperties}
        />
      ) : (
        <Icon
          name={icon}
          size={size}
          color={color ? color : DARK}
          testID={testID}
          //@ts-ignore
          tvParallaxProperties={tvParallaxProperties}
        />
      )}
    </View>
  );
};

