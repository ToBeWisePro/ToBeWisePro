// Take in a JSON file of quotes and add them to our Mongo Realms Database
// FIXME have a single cleanup function that gets called instead of using the safechar in a bunch of different places
import { QuotationInterface } from "../constants/Interfaces";
import { strings } from "../constants/Strings";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { PRIMARY_BLUE } from "../../../styles/Colors";
import { Alert, Linking } from "react-native";
import { globalStyles } from "../../../styles/GlobalStyles";

export const shuffle = (unshuffledQuotes: QuotationInterface[]) => {
  const shuffledQuotes: QuotationInterface[] = [];
  let i = unshuffledQuotes.length,
    randomIndex;
  unshuffledQuotes.forEach((quote: QuotationInterface) => {
    const quoteWithoutSafeChars: QuotationInterface = {
      _id: quote._id,
      quoteText: quote.quoteText,
      author: quote.author.replaceAll(strings.database.safeChar, "'"),
      authorLink: quote.authorLink,
      videoLink: quote.videoLink,
      contributedBy: quote.contributedBy,
      subjects: quote.subjects,
      favorite: quote.favorite,
    };
    // XXX cast Results<Object> to Quotation
    shuffledQuotes.push(quoteWithoutSafeChars);
  });
  while (i != 0) {
    randomIndex = Math.floor(Math.random() * i);
    i--;
    [shuffledQuotes[i], shuffledQuotes[randomIndex]] = [
      shuffledQuotes[randomIndex],
      shuffledQuotes[i],
    ];
  }
  return shuffledQuotes;
};

export const openLink = async (url: string) => {
  // Open a link in an in-app web browser
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: "cancel",
        preferredBarTintColor: PRIMARY_BLUE,
        preferredControlTintColor: "white",
        readerMode: false,
        animated: true,
        modalPresentationStyle: "fullScreen",
        modalTransitionStyle: "coverVertical",
        modalEnabled: true,
        enableBarCollapsing: false,
        animations: {
          startEnter: "slide_in_right",
          startExit: "slide_out_left",
          endEnter: "slide_in_left",
          endExit: "slide_out_right",
        },
        headers: {
          "my-custom-header": "my custom header value",
        },
      });
    } else await Linking.openURL(url);
  } catch (error) {
    // @ts-ignore
    Alert.alert(error.message);
  }
};

export const scrollToNextQuote = (
  playPressed: boolean,
  currentQuoteIndex: number,
  quotes: QuotationInterface[],
  flatListRef: any,
  setCurrentQuoteIndex: (i: number) => void,
  setPlayPressed: (x: boolean) => void,
  offset: number,
  setOffset: (x: number) => void
) => {
  if (playPressed) {
    if (currentQuoteIndex < quotes.length - 1) {
      const newIndex: number = currentQuoteIndex + 1;
      if (!isNaN(newIndex) && newIndex >= 0 && newIndex < quotes.length) { // Add this line
        flatListRef.current?.scrollToIndex({
          index: newIndex,
          animated: true,
          viewPosition: 0,
        });
        const newOffset: number =
          offset +
          globalStyles.smallQuoteContainer.height +
          globalStyles.smallQuoteContainer.marginBottom;
        setOffset(newOffset);
        setCurrentQuoteIndex(newIndex);
      } else {
        console.warn("Invalid newIndex:", newIndex); // Add this line
      }
    } else {
      // This will stop it from going out of bounds
      setPlayPressed(false);
    }
  }
};



