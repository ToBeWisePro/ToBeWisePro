import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { globalStyles } from "../../../styles/GlobalStyles";
import { AppText } from "../atoms/AppText";
import { QuoteButtonBar } from "../molecules/QuoteButtonBar";
import { updateQuoteContainer } from "../../res/functions/DBFunctions";
import { largeQuoteContainerRefreshRate } from "../../res/constants/Values";
import { strings } from "../../res/constants/Strings";
import { openLink } from "../../res/functions/UtilFunctions";
import { TouchableOpacity } from "react-native-gesture-handler";

interface Props {
  passedInQuote: QuotationInterface;
  navigation: NavigationInterface;
}

export const LargeQuoteContainer: React.FC<Props> = ({
  passedInQuote,
  navigation,
}: Props) => {
  const [contributedBy, setContributedBy] = useState<string>("");
  const [quote, setQuote] = useState<QuotationInterface>(passedInQuote);
  useEffect(() => {
    setQuote(passedInQuote);
    try {
      if (quote.contributedBy != undefined) {
        setContributedBy(quote.contributedBy);
      } else setContributedBy("");
    } catch {
      setContributedBy("");
    }
  }, []);

  useEffect(() => {
    updateQuoteContainer(quote, largeQuoteContainerRefreshRate, setQuote);
  }, []);
  try {
    // try/catch block is here in case the user is in a author/subject quote view and they delete the last quote
    return (
      <View style={styles.container}>
        <AppText style={globalStyles.quoteText} numberOfLines={16}>
          {quote.quoteText}
        </AppText>
        <View style={styles.authorContainer}>
          {contributedBy.length > 0 && (
            <AppText style={styles.contributedByText}>
              {"Contributed by: " + quote.contributedBy}
            </AppText>
          )}
          <TouchableOpacity
            onPress={() => {
              console.log(quote.authorLink);
              const safeLink = quote.author.replaceAll(" ", "_");
              openLink(quote.authorLink).catch(()=>openLink("https://www.wikipedia.com/wiki/" + safeLink)
              )
            }}
          >
            <AppText style={[globalStyles.authorText, { color: PRIMARY_BLUE }]}>
              {quote.author}
            </AppText>
          </TouchableOpacity>
        </View>
        <QuoteButtonBar quote={quote} navigation={navigation} />
      </View>
    );
  } catch {
    navigation.push(strings.screenName.home, {});
    return <AppText>{strings.copy.errorMessages.screenFailedToLoad}</AppText>;
  }
};

const styles = StyleSheet.create({
  container: {
    height: "70%",
    width: globalStyles.largeQuoteContainer.width,
    justifyContent: "flex-end",
    marginLeft: globalStyles.largeQuoteContainer.marginLeft,
    padding: 20,
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

  authorContainer: {
    paddingTop: 20,
    justifyContent: "flex-end",
    alignContent: "flex-end",
    height: 50,
    paddingBottom: 10,
    marginBottom: 10,
  },
  contributedByText: {
    fontSize: 14,
  },
});
