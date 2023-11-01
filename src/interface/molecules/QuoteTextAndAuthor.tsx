import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
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
    <View style={styles.quoteAuthorBox}>
      <AppText style={globalStyles.quoteText} numberOfLines={2048}>
        {quoteText}
      </AppText>
      <TouchableOpacity onPress={handleAuthorLink}>
        <AppText
          style={[
            globalStyles.authorText,
            { color: PRIMARY_BLUE, paddingTop: 20 },
          ]}
        >
          {author}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  quoteAuthorBox: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QuoteTextAndAuthor;
