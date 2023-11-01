import React from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { globalStyles } from "../../../styles/GlobalStyles";
import { PRIMARY_BLUE } from "../../../styles/Colors";
import { openLink } from "../../res/functions/UtilFunctions";
import { AppText } from "../atoms/AppText";

interface QuoteTextAndAuthorProps {
  quoteText: string;
  author: string;
  authorLink?: string;
}

const QuoteTextAndAuthor: React.FC<QuoteTextAndAuthorProps> = ({
  quoteText,
  author,
  authorLink,
}) => {
  const handleAuthorLink = (): void => {
    const link =
      authorLink ||
      `https://www.google.com/search?q=${encodeURIComponent(author)}`;
    void openLink(link);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.quoteBox}
        contentContainerStyle={styles.quoteContentContainer}
      >
        <AppText style={[globalStyles.quoteText, styles.quoteText]}>
          {quoteText}
        </AppText>
        <TouchableOpacity onPress={handleAuthorLink} style={styles.authorBox}>
          <AppText style={[globalStyles.authorText, styles.authorText]}>
            {author}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  quoteBox: {
    flex: 0.8, // Adjust this value to fit the quote in the desired position
  },
  quoteContentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 0, // Add padding at the bottom
  },
  quoteText: {
    textAlign: "center",
  },
  authorBox: {
    flex: 0.2,
    justifyContent: "center",
    alignItems: "center",
  },
  authorText: {
    color: PRIMARY_BLUE,
  },
});

export default QuoteTextAndAuthor;
