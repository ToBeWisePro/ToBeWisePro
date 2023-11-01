import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { GRAY_3, LIGHT } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { getQuoteCount } from "../../backend/DBFunctions";
import { type NavigationInterface } from "../../res/constants/Interfaces";
import { strings } from "../../res/constants/Strings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../../res/constants/Enums";

interface Props {
  query: string;
  navigation: NavigationInterface;
  filter: string;
  onPress?: (query: string, filter: string) => Promise<void>;
}

export const DiscoverTile: React.FC<Props> = ({
  query,
  navigation,
  filter,
  onPress,
}: Props) => {
  const [count, setCount] = useState<number | string>("loading...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCountForComponent = async (
      value: string,
      filter: string,
    ): Promise<void> => {
      await getQuoteCount(value, filter).then(
        (res: React.SetStateAction<number>) => {
          setCount(res.toString());
        },
      );
    };

    switch (query) {
      case strings.customDiscoverHeaders.all:
        void getCountForComponent(query, strings.customDiscoverHeaders.all);
        break;
      case strings.customDiscoverHeaders.addedByMe:
        void getCountForComponent(
          query,
          strings.customDiscoverHeaders.addedByMe,
        );
        break;
      case strings.customDiscoverHeaders.favorites:
        void getCountForComponent(
          query,
          strings.customDiscoverHeaders.favorites,
        );
        break;
      case strings.customDiscoverHeaders.top100:
      case "Top 100":
        void getCountForComponent(query, strings.customDiscoverHeaders.top100);
        break;
      case strings.customDiscoverHeaders.deleted:
        void getCountForComponent(query, strings.customDiscoverHeaders.deleted);
        break;
      default:
        void getCountForComponent(query, filter);
        break;
    }
  }, []);

  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={() => {
        setLoading(true);
        const executeAsyncOperations = async (): Promise<void> => {
          if (onPress != null) {
            if (parseInt(count.toString(), 10) !== 0) {
              await onPress(query, filter);
            } else {
              Alert.alert(strings.copy.countZeroErrorText);
            }
          } else {
            await AsyncStorage.setItem(ASYNC_KEYS.query, query);
            await AsyncStorage.setItem(ASYNC_KEYS.filter, filter);
            await AsyncStorage.setItem(ASYNC_KEYS.notifTitle, "");
            navigation.navigate(strings.screenName.home);
          }
          setLoading(false);
        };
        void executeAsyncOperations();
      }}
    >
      {loading ? (
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
    fontSize: 16,
  },
  count: {
    color: GRAY_3,
  },
});
