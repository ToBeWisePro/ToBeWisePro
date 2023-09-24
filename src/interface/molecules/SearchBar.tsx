import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  type TextInput,
} from "react-native"; // Fixed the import of TextInput
import { LIGHT } from "../../../styles/Colors";
import { IconFactory } from "../atoms/IconFactory";
import { TextInputField, TextInputSize } from "../atoms/TextInputField";
import { strings } from "../../res/constants/Strings";

interface Props {
  state: string;
  setState: (x: string) => void;
}

export const SearchBar: React.FC<Props> = ({ state, setState }: Props) => {
  const searchInput = useRef<TextInput>(null);

  const clearSearch = (): void => {
    setState("");
    searchInput.current?.blur();
  };

  return (
    <View style={styles.container}>
      <IconFactory icon={"search"} selected={false} />
      <View style={{ width: 300 }}>
        <TextInputField
          size={TextInputSize.Small}
          setState={setState}
          placeholderText={strings.copy.searchBarPlaceholderText}
          state={state}
          ref={searchInput}
        />
      </View>
      {state.length > 0 && (
        <TouchableOpacity onPress={clearSearch}>
          <IconFactory icon={"close"} selected={false} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 51,
    width: 365,
    backgroundColor: LIGHT,
    marginTop: 33,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    paddingHorizontal: 10,
    flexDirection: "row",
  },
});
