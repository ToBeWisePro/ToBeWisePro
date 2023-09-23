import React, { type ReactNode } from "react";
import {
  Text,
  type TextStyle,
  type NativeSyntheticEvent,
  type NativeTouchEvent,
} from "react-native";

interface Props {
  children: string | ReactNode;
  maxFontSizeMultiplier?: number;
  onPress?: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail"; // Modified this line
}

export const AppText: React.FC<Props> = ({
  children,
  maxFontSizeMultiplier = 1,
  onPress,
  style,
  numberOfLines = 9999,
  ellipsizeMode = "tail", // This line remains the same
}: Props) => {
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      ellipsizeMode={ellipsizeMode} // This line remains the same
      onPress={onPress}
      numberOfLines={numberOfLines}
      style={style}
    >
      {children}
    </Text>
  );
};
