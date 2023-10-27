import React from "react";
import { StyleSheet, View } from "react-native";
import { GRAY_5, LIGHT } from "../../../styles/Colors";
import {
  type NavigationInterface,
  type QuotationInterface,
} from "../../res/constants/Interfaces";
import { globalStyles } from "../../../styles/GlobalStyles";
import { QuoteButtonBar } from "../molecules/QuoteButtonBar";
import { strings } from "../../res/constants/Strings";

import QuoteTextAndAuthor from "../molecules/QuoteTextAndAuthor";
import { AppText } from "../atoms/AppText";
interface Props {
  passedInQuote: QuotationInterface;
  navigation: NavigationInterface;
}

export const LargeQuoteContainer: React.FC<Props> = ({
  passedInQuote,
  navigation,
}) => {
  try {
    return (
      <View style={styles.container}>
        <View style={styles.quoteBox}>
          <QuoteTextAndAuthor
            quoteText={passedInQuote.quoteText}
            author={passedInQuote.author}
            authorLink={passedInQuote.authorLink}
          />
        </View>
        <View style={styles.designLine}></View>
        <QuoteButtonBar quote={passedInQuote} navigation={navigation} />
      </View>
    );
  } catch {
    navigation.push(strings.screenName.home, {});
    return <AppText>{strings.copy.errorMessages.screenFailedToLoad}</AppText>;
  }
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: globalStyles.largeQuoteContainer.width,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: LIGHT,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
  },
  quoteBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  designLine: {
    height: 1,
    backgroundColor: GRAY_5,
    marginVertical: 10,
  },
});

export default LargeQuoteContainer;
