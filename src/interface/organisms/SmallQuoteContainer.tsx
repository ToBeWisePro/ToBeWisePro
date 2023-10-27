import React from "react";
import { StyleSheet, View } from "react-native";
import { LIGHT } from "../../../styles/Colors";
import { type QuotationInterface } from "../../res/constants/Interfaces";
import { globalStyles } from "../../../styles/GlobalStyles";
import { AppText } from "../atoms/AppText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface Props {
  passedInQuote: QuotationInterface;
  pressFunction: () => void;
  testID?: string;
}

const SmallQuoteContainer: React.FC<Props> = ({
  passedInQuote,
  pressFunction,
  testID,
}: Props) => {
  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={pressFunction}
      testID={testID}
    >
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
    paddingTop: 40, // Equivalent of two blank lines
    paddingBottom: 20, // Equivalent of one blank line
    height: globalStyles.smallQuoteContainer.height - 70,
    alignItems: "center",
    justifyContent: "center",
  },
  authorContainer: {
    justifyContent: "center",
    alignContent: "center",
    height: 40,
  },
  contributedByText: {
    fontSize: 14,
  },
});

export default React.memo(SmallQuoteContainer);
