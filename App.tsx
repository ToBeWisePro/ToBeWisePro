// App.js
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import {
  dataImporter,
  getShuffledQuotes,
} from "./src/res/functions/DBFunctions";
import { strings } from "./src/res/constants/Strings";
import { RootNavigation } from "./src/res/util/RootNavigation";
import {
  type NavigationInterface,
  type QuotationInterface,
} from "./src/res/constants/Interfaces";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { scheduleNotifications } from "./src/res/util/NotificationScheduler";
import {
  CommonActions,
  type NavigationContainerRef,
} from "@react-navigation/native";
import { ASYNC_KEYS } from "./src/res/constants/Enums";
import { convertDateTo24h } from "./src/res/util/BackwardsCompatability";
export const navigationRef =
  React.createRef<NavigationContainerRef<NavigationInterface>>();

export default function App(): JSX.Element {
  const [shuffledQuotes, setShuffledQuotes] = useState<QuotationInterface[]>(
    [],
  );
  const saveDefaultValue = async (key: string, value: any): Promise<void> => {
    try {
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue === null) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error saving default value:", error);
    }
  };

  useEffect(() => {
    void (async (): Promise<void> => {
      await saveDefaultValue(ASYNC_KEYS.allowNotifications, true);
      await convertDateTo24h(ASYNC_KEYS.startTime24h, 900);
      await convertDateTo24h(ASYNC_KEYS.endTime24h, 1700);
      await saveDefaultValue(
        ASYNC_KEYS.notificationQuery,
        strings.database.defaultQuery,
      );
      await saveDefaultValue(
        ASYNC_KEYS.notificationFilter,
        strings.database.defaultFilter,
      );

      void saveDefaultValue(ASYNC_KEYS.spacing, 30);
    })().then(() => {
      void scheduleNotifications();
    });

    void (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Notification permissions not granted.");
      }
    })();
    Notifications.addNotificationResponseReceivedListener((response) => {
      const quote = response.notification.request.content.data.quote;
      if (quote == null) {
        console.error("Data from notification is not defined");
        return;
      }

      (async () => {
        try {
          await AsyncStorage.setItem(
            ASYNC_KEYS.notifQuote,
            JSON.stringify(quote),
          );
          await AsyncStorage.setItem(
            ASYNC_KEYS.notifTitle,
            strings.copy.notificationFrom,
          );

          navigationRef.current?.dispatch(
            CommonActions.navigate(strings.screenName.homeHorizontal, {
              quoteSearch: {
                query: quote.subjects,
                filter: "",
              },
              currentQuotes: [quote],
              showBackButton: false,
            }),
          );
        } catch (error) {
          console.error("Error saving quote:", error);
        }
      })().catch((error) => {
        console.error("Unexpected error:", error);
      });
    });

    // Set a default filter if none is set
    const i = async (): Promise<void> => {
      await AsyncStorage.getItem(ASYNC_KEYS.filter).then(async (res) => {
        if (res === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.filter,
            strings.database.defaultFilter,
          );
        }
      });

      // set a default subject if none is set
      await AsyncStorage.getItem(ASYNC_KEYS.query).then(async (res) => {
        if (res === null) {
          await AsyncStorage.setItem(
            ASYNC_KEYS.query,
            strings.database.defaultQuery,
          );
        }
      });
    };
    void i();
  }, []);

  useEffect(() => {
    const i = async (): Promise<void> => {
      // log the default query and filter

      await dataImporter().then(async () => {
        await getShuffledQuotes(false).then((res) => {
          setShuffledQuotes(res);
        });
      });
    };
    i().catch((error) => {
      Alert.alert("Error", error.message);
    });
  }, []);

  if (shuffledQuotes.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <RootNavigation initialRoute={"Home"} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
