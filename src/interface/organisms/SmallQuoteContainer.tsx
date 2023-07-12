import React from "react";
import { StyleSheet, TouchableOpacity, View, PanResponder } from "react-native";
import { DARK, LIGHT } from "../../../styles/Colors";
import { QuotationInterface } from "../../res/constants/Interfaces";
import { globalStyles } from "../../../styles/GlobalStyles";
import { AppText } from "../atoms/AppText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface Props {
  passedInQuote: QuotationInterface;
  pressFunction: () => void;
}

const SmallQuoteContainer: React.FC<Props> = ({
  passedInQuote,
  pressFunction,
}: Props) => {
  // const panResponder = PanResponder.create({
  //   onStartShouldSetPanResponder: () => true,
  //   onPanResponderGrant: pressFunction,
  // });

  return (
    // <View {...panResponder.panHandlers} style={styles.container}>
    <TouchableWithoutFeedback style={styles.container} onPress={pressFunction}>
      <View style={styles.quoteContainer}>
        <AppText style={globalStyles.quoteText} numberOfLines={6}>
          {passedInQuote.quoteText}
        </AppText>
      </View>
      <View style={styles.authorContainer}>
        <AppText style={globalStyles.authorText}>
          {passedInQuote.author}
        </AppText>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 370,
    alignSelf: "center",
    height: globalStyles.smallQuoteContainer.height,
    justifyContent: "center",
    backgroundColor: LIGHT,
    marginBottom: globalStyles.smallQuoteContainer.marginBottom,
    padding: 15,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
  },
  quoteContainer: {
    height: globalStyles.smallQuoteContainer.height - 70,
  },
  authorContainer: {
    justifyContent: "flex-end",
    alignContent: "flex-end",
    height: 40,
    borderColor: DARK,
    borderTopWidth: 0.5,
  },
  contributedByText: {
    fontSize: 14,
  },
});

export default React.memo(SmallQuoteContainer);
