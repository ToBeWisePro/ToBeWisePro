import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
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
  return (
    <View style={styles.quoteAuthorBox}>
      <AppText style={globalStyles.quoteText} numberOfLines={2048}>
        {quoteText}
      </AppText>
      {authorLink != null ? (
        <TouchableOpacity
          onPress={() => {
            void openLink(authorLink);
          }}
        >
          <AppText
            style={[
              globalStyles.authorText,
              { color: PRIMARY_BLUE, paddingTop: 20 },
            ]}
          >
            {author}
          </AppText>
        </TouchableOpacity>
      ) : (
        <Text style={globalStyles.authorText}>{author}</Text>
      )}
    </View>
  );
};

const styles = {
  quoteAuthorBox: {
    justifyContent: "center",
    alignItems: "center",
  },
};

export default QuoteTextAndAuthor;
