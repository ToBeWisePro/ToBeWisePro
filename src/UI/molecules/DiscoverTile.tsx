import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GRAY_3, LIGHT } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { getAllQuotes, getShuffledQuotes, getQuotesContributedByMe, getFavoriteQuotes, getQuoteCount } from "../../res/functions/DBFunctions";
import { QuotationInterface, NavigationInterface } from "../../res/constants/Interfaces";
import { BackButtonNavEnum } from "../../res/constants/Enums";
import { strings } from "../../res/constants/Strings";

interface Props {
  query: string;
  navigation: NavigationInterface
  filter: string;
}

export const DiscoverTile: React.FC<Props> = ({
  query,
  navigation,
  filter,
}: Props) => {
  const [count, setCount] = useState<number>(-1)

  useEffect(()=>{
  
    const getCountForComponent = async (value: string, filter: string)=>{
      await getQuoteCount(value, filter).then((res: React.SetStateAction<number>)=>{
        // console.log(query, ": ", res)
        setCount(res)}
        )
  }
  getCountForComponent(query, filter)
  }, [])

  return (
    <TouchableWithoutFeedback
      style={styles.container}

      onPress={async () => {
        const getQuotesFromQuery = async() => {
          safeQuery = query.replaceAll("'", strings.database.safeChar);
          await getShuffledQuotes(safeQuery, filter).then((res: QuotationInterface[]) => navPush(res));
        }
        const navPush = (res: QuotationInterface[])=>{
          navigation.push("Home", {
            currentQuotes: res,
            quoteSearch: {
              query: query,
              filter: filter
            },
            backButtonNavigationFunction: BackButtonNavEnum.GoBack,
          });
        }
        let safeQuery: string = query
        // see if we're using a special query. If not, use the default query
        switch(query){
          case strings.customDiscoverHeaders.all:
            await getAllQuotes().then((res: QuotationInterface[]) => navPush(res))
            break;
          case strings.customDiscoverHeaders.addedByMe:
            await getQuotesContributedByMe().then((res: QuotationInterface[])=> navPush(res))
            break;
          // case strings.customDiscoverHeaders.deleted:
          case strings.customDiscoverHeaders.favorites:
            await getFavoriteQuotes().then((res: QuotationInterface[])=> navPush(res))
            break;
          case strings.customDiscoverHeaders.top100:
            await getShuffledQuotes('Top 100', strings.filters.subject).then((res: QuotationInterface[])=> navPush(res))
            break;
          default:
            getQuotesFromQuery()
            break;
        }        
        
      }}
    >
      <AppText style={styles.title}>{query }</AppText>
      <AppText style={styles.count}>{" ("+ count.toString() + ")"}</AppText>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    width: "100%",
    borderBottomColor: GRAY_3,
    borderBottomWidth: 0.25,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  title: {
    marginLeft: 6,
  },
  count: {
    color: GRAY_3
  }
});
