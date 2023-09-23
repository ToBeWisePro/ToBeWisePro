import React, { forwardRef } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { AppText } from "./AppText";
import { LIGHT } from "../../../styles/Colors";

export interface TextInputProps {
  placeholderText: string;
  size?: TextInputSize;
  label?: string;
  state: string;
  setState: (ev: string) => void;
  id?: number;
  rightAlign?: boolean;
}

export enum TextInputSize {
  Small,
  Large,
}

const TextInputField = forwardRef<TextInput, TextInputProps>(
  (
    {
      placeholderText,
      size,
      label,
      state,
      setState,
      rightAlign,
    }: TextInputProps,
    ref,
  ) => {
    const getInputContainerStyle = (): any => {
      if (size === TextInputSize.Large) {
        return styles.largeContainer;
      } else {
        return styles.smallContainer;
      }
    };

    return (
      <View style={styles.container}>
        {label != null && <AppText style={styles.title}>{label}</AppText>}
        <View style={[styles.inputContainer, getInputContainerStyle()]}>
          <TextInput
            ref={ref}
            onChangeText={setState}
            placeholder={placeholderText}
            keyboardType={"default"}
            multiline={size === TextInputSize.Large}
            defaultValue={state}
            style={rightAlign ?? false ? styles.rightAlignedText : null}
          />
        </View>
      </View>
    );
  },
);

TextInputField.displayName = "TextInputField"; // Added displayName

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  inputContainer: {
    backgroundColor: LIGHT,
    width: "100%",
    borderRadius: 5,
    padding: 10,
  },
  rightAlignedText: {
    textAlign: "right",
  },
  largeContainer: {
    height: 235,
  },
  smallContainer: {
    height: 50,
    flexDirection: "row",
  },
});

export { TextInputField };
