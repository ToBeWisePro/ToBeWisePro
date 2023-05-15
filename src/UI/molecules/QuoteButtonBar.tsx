import React, { useEffect, useState } from "react";
import { Share, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import {
  NavigationInterface,
  QuotationInterface,
} from "../../res/constants/Interfaces";
import { IconFactory } from "../atoms/IconFactory";
import { PRIMARY_GREEN, PRIMARY_RED } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { strings } from "../../res/constants/Strings";
import {
  markQuoteAsDeleted,
  updateQuote,
} from "../../res/functions/DBFunctions";
import { QuoteContainerButtons } from "../../res/constants/Enums";
import { openLink } from "../../res/functions/UtilFunctions";

interface Props {
  quote: QuotationInterface;
  navigation: NavigationInterface;
}

export const QuoteButtonBar: React.FC<Props> = ({
  quote,
  navigation,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(quote.favorite);

  useEffect(() => {
    quote.favorite = isFavorite;
  }, [isFavorite]);

  const handleFavoritePress = async () => {
    const updatedFavoriteStatus = isFavorite === 0 ? 1 : 0;
    setIsFavorite(updatedFavoriteStatus);

    // Update the quote's favorite status in the database
    const updatedQuote = { ...quote, favorite: updatedFavoriteStatus };
    await updateQuote(updatedQuote);
  };

  const onShare = async () => {
    try {
      const websiteLink = quote.authorLink || "www.tobewise.co"; // replace with your website link
      const author = quote.author || "Unknown";
      const subjects = quote.subjects || "N/A";
      const message = `"${quote.quoteText}"\n\nAuthor: ${author}\nSubjects: ${subjects}\nRead more at ${websiteLink}`;

      const result = await Share.share({ message });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteFunction = async (quote: QuotationInterface) => {
    const shouldDelete = !quote.deleted; // If the quote is not currently deleted, we should delete it.
    await markQuoteAsDeleted(quote, shouldDelete);
    Alert.alert(
      shouldDelete
        ? "Quote deleted successfully!"
        : "Quote restored successfully!",
      "Reload the screen to see updates",
      [
        {
          text: "OK",
        },
      ],
      { cancelable: false }
    );
  };

  const buttons = [
    {
      id: QuoteContainerButtons.Add,
      name: QuoteContainerButtons.Add,
      onPress: () => {
        navigation.push(strings.screenName.editQuote, {
          editingQuote: {
            _id: parseInt(String(Math.random() * 100000)),
            author: "",
            authorLink: "",
            favorite: 0,
            quoteText: "",
            subjects: "",
            videoLink: "",
          },
          editingExistingQuote: false,
        });
      },
      iconName: "add",
      color: PRIMARY_GREEN,
    },
    {
      id: QuoteContainerButtons.Delete,
      name: QuoteContainerButtons.Delete,
      onPress: () => deleteFunction(quote),
      iconName: "delete",
      color: PRIMARY_GREEN,
    },

    {
      id: QuoteContainerButtons.Edit,
      name: QuoteContainerButtons.Edit,
      onPress: () =>
        navigation.push(strings.screenName.editQuote, {
          editingQuote: quote,
          editingExistingQuote: true,
        }),
      iconName: "edit",
      color: PRIMARY_GREEN,
    },
    {
      id: QuoteContainerButtons.Video,
      name: QuoteContainerButtons.Video,
      onPress: () => openLink(quote.videoLink),
      iconName: "movie",
      color: PRIMARY_GREEN,
    },
    {
      id: QuoteContainerButtons.Favorite,
      name: QuoteContainerButtons.Favorite,
      onPress: handleFavoritePress,
      iconName: isFavorite === 1 ? "favorite" : "favorite-outline",
      color: PRIMARY_RED,
    },
    {
      id: QuoteContainerButtons.Share,
      name: QuoteContainerButtons.Share,
      onPress: onShare,
      iconName: "share",
      color: PRIMARY_GREEN,
    },
  ];

  return (
    <View style={styles.buttonContainer}>
      {buttons.map((button) => (
        <TouchableOpacity
          onPress={button.onPress}
          key={button.id}
          style={styles.button}
        >
          <View style={styles.button}>
            <IconFactory
              selected={false}
              color={button.color}
              icon={button.iconName}
            />
            <AppText>{button.name}</AppText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    height: 40,
    width: "100%",
    justifyContent: "space-between",
  },
  button: {
    height: "100%",
  },
});
