import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { DARK, LIGHT } from "../../../styles/Colors";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { QuotationInterface } from "../../res/constants/Interfaces";
import { globalStyles } from "../../../styles/GlobalStyles";
import { AppText } from "../atoms/AppText";
import { updateQuoteContainer } from "../../res/functions/DBFunctions";
import { largeQuoteContainerRefreshRate as quoteContainerRefreshRate } from "../../res/constants/Values";

interface Props {
  passedInQuote: QuotationInterface;
  pressFunction: () => void;
}

export const SmallQuoteContainer: React.FC<Props> = ({
  passedInQuote,
  pressFunction,
}: Props) => {
  // const [orderedQuotes, setOrderQuotes] = useState<Quotation[]>([]);
  const [quote, setQuote] = useState<QuotationInterface>(passedInQuote);

  useEffect(() => {
    // We need the orderedQuotes so that when a user navigates to the HomeHorizontal screen the quotes stay in order
    // setOrderQuotes(quotes);
    // updateQuoteContainer(quote, quoteContainerRefreshRate, setQuote);
  }, []);

  return (
    <View style={styles.container}>
      {/* <QuoteBlock quote={quote} size={ContainerSize.Small}/> */}
      <TouchableOpacity onPress={pressFunction} style={styles.quoteContainer}>
        <AppText style={globalStyles.quoteText} numberOfLines={6}>
          {quote.quoteText}
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity onPress={pressFunction} style={styles.authorContainer}>
        <AppText style={globalStyles.authorText}>{quote.author}</AppText>
      </TouchableOpacity>
    </View>
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
    // paddingTop: 10,
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
