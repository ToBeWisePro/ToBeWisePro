// This code's purpose is to create a reusable text component
import React, { ReactNode } from 'react';
import { NativeSyntheticEvent, NativeTouchEvent, Text } from "react-native";

interface Props {
  children: string | ReactNode;
  maxFontSizeMultiplier?: number;
  onPress?: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void;
  style?: Record<string, unknown> | Array<Record<string, unknown>>;
  numberOfLines?: number,
}

export const AppText: React.FC<Props> = ({
  children,
  maxFontSizeMultiplier = 1.5,
  onPress,
  style,
  numberOfLines = 9999,
}: Props) => {
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      ellipsizeMode="tail"
      onPress={onPress}
      numberOfLines={numberOfLines}
      // style={[{ fontFamily: "Jost_400Regular" }, style]}
      style={style}
    >
            {/* FIXME choose and test font */}
      {children}
    </Text>
  );
};
