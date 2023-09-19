import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { GRAY_3, LIGHT } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { getQuoteCount } from "../../res/functions/DBFunctions";
import { QuotationInterface, NavigationInterface } from "../../res/constants/Interfaces";
import { strings } from "../../res/constants/Strings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../../res/constants/Enums";

interface Props {
  query: string;
  navigation: NavigationInterface;
  filter: string;
  onPress?: (query: string, filter: string) => Promise<void>;
}

export const DiscoverTile: React.FC<Props> = ({ query, navigation, filter, onPress }: Props) => {
  const [count, setCount] = useState<number | string>("loading...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCountForComponent = async (value: string, filter: string) => {
      await getQuoteCount(value, filter).then((res: React.SetStateAction<number>) => {
        setCount(res.toString());
      });
    };

    getCountForComponent(query, filter);
  }, []);

  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={async () => {
        setLoading(true);
        if (onPress) {
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
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={GRAY_3} />
      ) : (
        <>
          <AppText style={styles.title}>{query}</AppText>
          <AppText style={styles.count}>{" (" + count.toString() + ")"}</AppText>
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
