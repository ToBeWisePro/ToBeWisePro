import React, { useState } from "react";
import { Share, TouchableOpacity, View, StyleSheet, Alert } from "react-native";
import {
  type NavigationInterface,
  type QuotationInterface,
} from "../../res/constants/Interfaces";
import { IconFactory } from "../atoms/IconFactory";
import { PRIMARY_GREEN, PRIMARY_RED } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { strings } from "../../res/constants/Strings";
import { markQuoteAsDeleted, updateQuote } from "../../backend/DBFunctions";
import { QuoteContainerButtons } from "../../res/constants/Enums";
import { openLink } from "../../res/functions/UtilFunctions";
import ReactHapticFeedback from "react-native-haptic-feedback"; // <-- Import the module
import {
  firebaseEventsKeys,
  logFirebaseEvent,
} from "../../backend/FirebaseConfig";

interface Props {
  quote: QuotationInterface;
  navigation: NavigationInterface;
}

export const QuoteButtonBar: React.FC<Props> = ({
  quote,
  navigation,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(quote.favorite);
  const [isDeleted, setIsDeleted] = useState(quote.deleted);

  const handleFavoritePress = async (): Promise<void> => {
    logFirebaseEvent(firebaseEventsKeys.pressedFavorite, { quote });

    const updatedFavoriteStatus = !isFavorite;
    setIsFavorite(updatedFavoriteStatus);
    if (updatedFavoriteStatus) {
      ReactHapticFeedback.trigger("notificationSuccess", {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
    }

    // Use a cloned version of the quote object with the updated favorite status
    const updatedQuote = { ...quote, favorite: updatedFavoriteStatus };
    await updateQuote(updatedQuote);
  };

  const onShare = async (): Promise<void> => {
    logFirebaseEvent(firebaseEventsKeys.pressedShare, { quote });

    try {
      const message = `"${quote.quoteText}"\n-${quote.author}\n\nRead more on ToBeWise™ at https://www.ToBeWise.co`;

      const result = await Share.share({ message });

      if (result.action === Share.sharedAction) {
        if (result.activityType != null) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: unknown) {
      alert((error as Error).message);
    }
  };

  const deleteFunction = async (quote: QuotationInterface): Promise<void> => {
    const shouldDelete = !quote.deleted;
    setIsDeleted(shouldDelete);

    // Use a cloned version of the quote object with the updated deleted status
    const updatedQuote = { ...quote, deleted: shouldDelete };
    await markQuoteAsDeleted(updatedQuote, shouldDelete);

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
      { cancelable: false },
    );
  };

  const buttons = [
    {
      id: QuoteContainerButtons.Add,
      name: QuoteContainerButtons.Add,
      onPress: () => {
        logFirebaseEvent(firebaseEventsKeys.pressedAdd, { quote });
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
      name: isDeleted ? "Restore" : QuoteContainerButtons.Delete,
      onPress: () => {
        logFirebaseEvent(firebaseEventsKeys.pressedDelete, { quote });

        void deleteFunction(quote);
      },
      iconName: isDeleted ? "restore" : "delete",
      color: PRIMARY_GREEN,
    },

    {
      id: QuoteContainerButtons.Edit,
      name: QuoteContainerButtons.Edit,
      onPress: () => {
        logFirebaseEvent(firebaseEventsKeys.pressedEdit, { quote });

        navigation.push(strings.screenName.editQuote, {
          editingQuote: quote,
          editingExistingQuote: true,
        });
      },
      iconName: "edit",
      color: PRIMARY_GREEN,
    },
    {
      id: QuoteContainerButtons.Video,
      name: QuoteContainerButtons.Video,
      onPress: async () => {
        logFirebaseEvent(firebaseEventsKeys.pressedVideo, { quote });

        // Extracting the first subject from the subjects list (assuming subjects are comma-separated)
        const firstSubject = quote.subjects.split(",")[0].trim();

        const link =
          quote.videoLink.trim() === ""
            ? `https://www.ted.com/search?q=${encodeURIComponent(firstSubject)}`
            : quote.videoLink;

        await openLink(link);
      },

      iconName: "movie",
      color: PRIMARY_GREEN,
    },
    {
      id: QuoteContainerButtons.Favorite,
      name: QuoteContainerButtons.Favorite,
      onPress: handleFavoritePress,
      iconName: isFavorite ? "favorite" : "favorite-outline",
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
        <View style={styles.buttonWrapper} key={button.id}>
          <TouchableOpacity onPress={button.onPress}>
            <IconFactory
              selected={false}
              color={button.color}
              icon={button.iconName}
            />
          </TouchableOpacity>
          <AppText>{button.name}</AppText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    height: 60, // Adjusted to give room for text below buttons
    width: "100%",
    justifyContent: "space-between",
  },
  buttonWrapper: {
    alignItems: "center", // Center the child components (Icon and Text)
  },
});
