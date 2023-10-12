// Take in a JSON file of quotes and add them to our Mongo Realms Database
// FIXME have a single cleanup function that gets called instead of using the safechar in a bunch of different places
import { type QuotationInterface } from "../constants/Interfaces";
import { strings } from "../constants/Strings";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import { PRIMARY_BLUE } from "../../../styles/Colors";
import { Linking } from "react-native";

import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useTitle = (): {
  title: string;
  updateTitle: (filter: string, query: string) => Promise<void>;
} => {
  const [title, setTitle] = useState("");

  const updateTitle = async (filter: string, query: string): Promise<void> => {
    try {
      const title = `${filter}: ${query}`;
      setTitle(title);
      await AsyncStorage.setItem("title", title);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  useEffect(() => {
    const getTitle = async (): Promise<void> => {
      try {
        const savedTitle = await AsyncStorage.getItem("title");
        if (savedTitle != null) setTitle(savedTitle);
      } catch (error) {
        console.error("Error getting title:", error);
      }
    };
    void getTitle();
  }, []);

  return { title, updateTitle };
};

export const shuffle = (
  unshuffledQuotes: QuotationInterface[],
): QuotationInterface[] => {
  const shuffledQuotes: QuotationInterface[] = [];
  let i = unshuffledQuotes.length;
  let randomIndex;
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
      deleted: quote.deleted,
    };
    // XXX cast Results<Object> to Quotation
    shuffledQuotes.push(quoteWithoutSafeChars);
  });
  while (i !== 0) {
    randomIndex = Math.floor(Math.random() * i);
    i--;
    [shuffledQuotes[i], shuffledQuotes[randomIndex]] = [
      shuffledQuotes[randomIndex],
      shuffledQuotes[i],
    ];
  }
  return shuffledQuotes;
};

export const openLink = async (url: string): Promise<void> => {
  // Convert spaces to browser-friendly format
  const formattedUrl = url.replace(/ /g, "%20");

  // Open a link in an in-app web browser
  if (await InAppBrowser.isAvailable()) {
    await InAppBrowser.open(formattedUrl, {
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
  } else await Linking.openURL(formattedUrl);
};

interface TimeFormat {
  hour: number;
  minute: string;
  period: "AM" | "PM";
}

export const convertTo12HourFormat = (
  hour24: number,
  minute: number,
): TimeFormat => {
  let period: "AM" | "PM" = "AM";
  if (hour24 >= 12) {
    period = "PM";
    if (hour24 > 12) hour24 -= 12;
  }
  if (hour24 === 0) hour24 = 12;
  return {
    hour: hour24,
    minute: minute < 10 ? "0" + minute : minute.toString(),
    period,
  };
};
