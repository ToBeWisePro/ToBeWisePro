import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { GRAY_3, LIGHT } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import {
  getAllQuotes,
  getShuffledQuotes,
  getQuotesContributedByMe,
  getFavoriteQuotes,
  getQuoteCount,
} from "../../res/functions/DBFunctions";
import {
  QuotationInterface,
  NavigationInterface,
} from "../../res/constants/Interfaces";
import { BackButtonNavEnum } from "../../res/constants/Enums";
import { strings } from "../../res/constants/Strings";

interface Props {
  query: string;
  navigation: NavigationInterface;
  filter: string;
  onPress?: (query: string, filter: string) => Promise<void>; // Add this line
}

export const DiscoverTile: React.FC<Props> = ({
  query,
  navigation,
  filter,
  onPress,
}: Props) => {
  const [count, setCount] = useState<string>("loading...");
  const [loading, setLoading] = useState(false); // Add this line

  useEffect(() => {
    const getCountForComponent = async (value: string, filter: string) => {
      await getQuoteCount(value, filter).then(
        (res: React.SetStateAction<number>) => {
          setCount(res.toString());
        }
      );
    };

    switch (query) {
      case strings.customDiscoverHeaders.all:
        getCountForComponent(query, strings.customDiscoverHeaders.all);
        break;
      case strings.customDiscoverHeaders.addedByMe:
        getCountForComponent(query, strings.customDiscoverHeaders.addedByMe);
        break;
      case strings.customDiscoverHeaders.favorites:
        getCountForComponent(query, strings.customDiscoverHeaders.favorites);
        break;
      case strings.customDiscoverHeaders.top100 || "Top 100":
        getCountForComponent(query, strings.customDiscoverHeaders.top100);
        break;
      case strings.customDiscoverHeaders.deleted:
        getCountForComponent(query, strings.customDiscoverHeaders.deleted);
        break;
      default:
        getCountForComponent(query, filter);
        break;
    }
  }, []);

  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={async () => {
        setLoading(true); // Add this line
        if (onPress) {
          onPress(query, filter);
        } else {
          const getQuotesFromQuery = async () => {
            safeQuery = query.replaceAll("'", strings.database.safeChar);
            await getShuffledQuotes(safeQuery, filter).then(
              (res: QuotationInterface[]) => navPush(res)
            );
          };
          const navPush = (res: QuotationInterface[]) => {
            navigation.push("Home", {
              currentQuotes: res,
              quoteSearch: {
                query: query,
                filter: filter,
              },
              backButtonNavigationFunction: BackButtonNavEnum.GoBack,
            });
          };
          let safeQuery: string = query;
          // see if we're using a special query. If not, use the default query
          switch (query) {
            case strings.customDiscoverHeaders.all:
              await getAllQuotes().then((res: QuotationInterface[]) =>
                navPush(res)
              );
              break;
            case strings.customDiscoverHeaders.addedByMe:
              await getQuotesContributedByMe().then(
                (res: QuotationInterface[]) => navPush(res)
              );
              break;
            // case strings.customDiscoverHeaders.deleted:
            case strings.customDiscoverHeaders.favorites:
              await getFavoriteQuotes().then((res: QuotationInterface[]) => {
                navPush(res);
              });
              break;
            case strings.customDiscoverHeaders.top100:
              await getShuffledQuotes("Top 100", strings.filters.subject).then(
                (res: QuotationInterface[]) => navPush(res)
              );
              break;
            case strings.customDiscoverHeaders.deleted:
              await getShuffledQuotes(
                strings.customDiscoverHeaders.deleted,
                strings.filters.subject
              ).then((res: QuotationInterface[]) => navPush(res));
              break;
            default:
              getQuotesFromQuery();
              break;
          }
        }
        setLoading(false); // Add this line
      }}
    >
      {loading ? ( // Add these lines
        <ActivityIndicator size="small" color={GRAY_3} />
      ) : (
        <>
          <AppText style={styles.title}>{query}</AppText>
          <AppText style={styles.count}>
            {" (" + count.toString() + ")"}
          </AppText>
        </>
      )}
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
    justifyContent: "flex-start",
  },
  title: {
    marginLeft: 6,
  },
  count: {
    color: GRAY_3,
  },
});
