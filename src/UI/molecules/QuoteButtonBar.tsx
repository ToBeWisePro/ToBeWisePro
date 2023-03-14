import React, {useEffect, useState} from "react";
import {Share, TouchableOpacity, View, StyleSheet} from "react-native";
import { NavigationInterface, QuotationInterface } from "../../res/constants/Interfaces";
import { IconFactory } from "../atoms/IconFactory";
import { PRIMARY_GREEN } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { strings } from "../../res/constants/Strings";
import { deleteQuote } from "../../res/functions/DBFunctions";
import { QuoteContainerButtons } from "../../res/constants/Enums";
import { openLink } from "../../res/functions/UtilFunctions";


interface Props {
  quote: QuotationInterface;
  navigation: NavigationInterface
}

interface Button {
  id: string;
  name: string;
  onPress: () => void;
}

export const QuoteButtonBar: React.FC<Props> = ({ quote, navigation }: Props) => {

  const [isFavorite, setIsFavorite] = useState(quote.favorite)

  useEffect(()=>{
    quote.favorite = isFavorite
  },[isFavorite])

  const buttons: Button[] = [
      // All of the buttons that appear on the bottom of the large quote container and their functionalities are defined here
    {
      id: QuoteContainerButtons.Add,
      name: QuoteContainerButtons.Add,
      onPress: () =>{
        const newQuote: QuotationInterface = {
          _id: parseInt(String(Math.random() * 100000)),
          author: "",
          authorLink: "",
          favorite: 0,
          quoteText: "",
          subjects: "",
          videoLink: ""
        }
        navigation.push(strings.screenName.editQuote, {editingQuote: newQuote})
      }
    },
    {
      id: QuoteContainerButtons.Delete,
      name: QuoteContainerButtons.Delete,
      onPress: async () => await deleteQuote(quote),
    },
    {
      id: QuoteContainerButtons.Edit,
      name: QuoteContainerButtons.Edit,
      onPress: () => navigation.push(strings.screenName.editQuote, {editingQuote: quote})
    },
    {
      id: QuoteContainerButtons.Video,
      name: QuoteContainerButtons.Video,
      onPress: async () => {
        await openLink(quote.videoLink)
      }
    },
    {
      id: QuoteContainerButtons.Favorite,
      name: QuoteContainerButtons.Favorite,
      onPress: () => {
        if(isFavorite == 0){
          setIsFavorite(1)
        } else if(isFavorite == 1){
          setIsFavorite(0)
        } else {
          console.log("Invalid value for quote favorite: {", quote.favorite + "}. Setting to 0")
          setIsFavorite(0)
        }
      },
    },
    {
      id: QuoteContainerButtons.Share,
      name: QuoteContainerButtons.Share,
      onPress: async () => await onShare()
    },
  ];
  let getIcon = (fav: number, name: string) => {
    switch (name) {
      case QuoteContainerButtons.Add:
        return "add";
      case QuoteContainerButtons.Delete:
        return "delete";
      case QuoteContainerButtons.Edit:
        return "edit";
      case QuoteContainerButtons.Video:
        return "movie";
      case QuoteContainerButtons.Favorite:
        if (fav == 1) {
          return "favorite-outline";
        } else return "favorite";
      case QuoteContainerButtons.Share:
        return "share";
      default:
        return "report";
    }
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
            quote.quoteText + " - " + quote.author + " " + strings.copy.shareMessage
      });
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
      // @ts-ignore
      alert(error.message);
    }
  }

  return (
    <View style={styles.buttonContainer}>
      {buttons.map((button) => (
        <TouchableOpacity onPress={button.onPress} key={button.id} style={styles.button}>
          <View style={styles.button}>
          <IconFactory
            selected={false}
            color={PRIMARY_GREEN}
            icon={getIcon(isFavorite, button.name)}
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
  button:{
    height: "100%"
  }
});
