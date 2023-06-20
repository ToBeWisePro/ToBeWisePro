import React from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { strings } from "../../res/constants/Strings";
import { QuotationInterface } from "../../res/constants/Interfaces";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { IconFactory } from "./IconFactory";
import { LIGHT, PRIMARY_BLUE, PRIMARY_GREEN } from "../../../styles/Colors";

interface Props {
  buttonText: string;
  selected: boolean;
  navigationTarget: string;
  navigation: {
    push: (ev: string, {}) => void;
  };
}

const renderIcon = (screen: string, selected: boolean) => {
  switch (screen) {
    case strings.screenName.discover:
      return <IconFactory icon="search" selected={selected} />;
    case strings.screenName.home:
      return <IconFactory icon="home" selected={selected} />;
    case strings.screenName.settings:
      return <IconFactory icon="settings" selected={selected} />;
    default:
      console.log("error rendering icon");
      return <AppText>Error: no icon found for {screen} </AppText>;
  }
};

export const NavButton: React.FC<Props> = ({
  buttonText,
  selected,
  navigationTarget,
  navigation,
}: Props) => {
  return (
    <TouchableWithoutFeedback
      style={[
        styles.container,
        { backgroundColor: selected ? PRIMARY_GREEN : PRIMARY_BLUE },
      ]}
      onPress={async () => {
        if (navigationTarget == strings.screenName.home) {
          await getShuffledQuotes(strings.database.defaultQuery, strings.filters.subject).then((res: QuotationInterface[]) => {
            navigation.push("Home", { currentQuotes: res, queryCategory: strings.database.defaultQuery });
            console.log("Home pushed")
          });
        } else {
          navigation.push(navigationTarget, {});
        }
      }}
    >
      {selected ? (
        <View>
          {renderIcon(navigationTarget, true)}
          <AppText style={styles.selected}>{buttonText}</AppText>
        </View>
      ) : (
        <View>
          {renderIcon(navigationTarget, false)}
          <AppText>{buttonText}</AppText>
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
    height: "100%",
    width: "100%",
  },
  selected: {
    color: LIGHT,
  },
});
