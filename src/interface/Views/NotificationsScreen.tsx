import React, { useState, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { strings } from "../../res/constants/Strings";
import {
  type NavigationInterface,
  type QuotationInterface,
  type RouteInterface,
} from "../../res/constants/Interfaces";
import {
  GRAY_2,
  GRAY_5,
  GRAY_6,
  LIGHT,
  PRIMARY_GREEN,
} from "../../../styles/Colors";
import { BottomNav } from "../organisms/BottomNav";
import { ASYNC_KEYS, IncludeInBottomNav } from "../../res/constants/Enums";
import { TopNav } from "../molecules/TopNav";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { AppText } from "../atoms/AppText";
import { CustomTimeInput } from "../atoms/CustomTimeInput";
import { scheduleNotifications } from "../../res/util/NotificationScheduler";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { TEST_IDS } from "../../res/constants/TestIDs";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const saveSettings = async (
  key: string,
  value: any,
): Promise<any | null> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const loadSettings = async (key: string): Promise<any | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const NotificationScreen: React.FC<Props> = ({
  navigation,
  route,
}: Props) => {
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(2359);
  const [spacing, setSpacing] = useState(30);
  const [query, setQuery] = useState(strings.database.defaultQuery);

  const loadSavedSettings = async (): Promise<void> => {
    const savedAllowNotifications = await loadSettings(
      ASYNC_KEYS.allowNotifications,
    );
    const savedStartTime = await loadSettings(ASYNC_KEYS.startTime24h);
    const savedEndTime = await loadSettings(ASYNC_KEYS.endTime24h);
    const savedSpacing = await loadSettings(ASYNC_KEYS.spacing);
    const savedQuery = await loadSettings(ASYNC_KEYS.notificationQuery);

    if (savedQuery !== null) {
      setQuery(savedQuery);
    }
    if (savedAllowNotifications !== null) {
      setAllowNotifications(savedAllowNotifications);
    }
    if (savedStartTime !== null) {
      setStartTime(savedStartTime);
    }
    if (savedEndTime !== null) {
      setEndTime(savedEndTime);
    }
    if (savedSpacing !== null) {
      setSpacing(savedSpacing);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      void loadSavedSettings();
    });

    // Clean up the event listener on component unmount
    return unsubscribe;
  }, [navigation]);

  const toggleSwitch = (): void => {
    const updatedAllowNotifications = !allowNotifications;
    setAllowNotifications(updatedAllowNotifications);
    void saveSettings(ASYNC_KEYS.allowNotifications, updatedAllowNotifications);
  };
  const isValidTimeRange = (start: number, end: number): boolean => {
    return start <= end;
  };

  const handleStartTimeChange = (time: number): void => {
    if (isValidTimeRange(time, endTime)) {
      setStartTime(time);
      void saveSettings(ASYNC_KEYS.startTime24h, time);
    } else {
      alert(`Start Time must be less than or equal to End Time.`);
    }
  };

  const handleButtonPress = async (): Promise<void> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("You need to grant permission to receive notifications");
        return;
      }
      let data = await getShuffledQuotes(true);
      if (data.length === 0) {
        alert("Invalid query. Notifications database set to defaults");
        await AsyncStorage.setItem(
          ASYNC_KEYS.notificationFilter,
          strings.database.defaultFilter,
        );
        await AsyncStorage.setItem(
          ASYNC_KEYS.notificationQuery,
          strings.database.defaultQuery,
        );
        data = await getShuffledQuotes(false);
      }

      // if the current time (ignoring date) is less than the end time and if the current time is greater than the start time (also ignoring date), send a message
      const currentTime = new Date();
      const currentIntTime =
        currentTime.getHours() * 100 + currentTime.getMinutes();
      if (currentIntTime >= startTime && currentIntTime <= endTime) {
        Alert.alert(strings.copy.newNotificationsSet);

        const quote: QuotationInterface = data[0];
        await Notifications.presentNotificationAsync({
          title: strings.copy.notificationTitle,
          body: quote.quoteText + "\n- " + quote.author,
          data: {
            quote,
          },
        });
      } else {
        Alert.alert(
          "Notifications will be sent between " +
            startTime.toLocaleString() +
            " and " +
            endTime.toLocaleString() +
            ".",
        );
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to send the notification");
    }
  };

  const handleEndTimeChange = (time: number): void => {
    if (isValidTimeRange(startTime, time)) {
      setEndTime(time);
      void saveSettings(ASYNC_KEYS.endTime24h, time);
      void scheduleNotifications();
    } else {
      alert(`End Time must be greater than or equal to Start Time.`);
    }
  };

  const handleSpacingChange = async (value: number): Promise<void> => {
    await saveSettings(ASYNC_KEYS.spacing, value).then(async () => {
      setSpacing(value);
      await scheduleNotifications()
        .then(() => {
          console.log("notifs scheduled");
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  return (
    <View style={styles.container}>
      <TopNav
        backButton={true}
        backFunction={() => {
          navigation.goBack();
        }}
        title={strings.screenName.notificationsScreen}
        stickyHeader={true}
        testID={TEST_IDS.topNav}
      />
      <View style={{ backgroundColor: LIGHT }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.main}>
            <View style={styles.menuOptionContainerBottom}>
              <AppText>Allow Notifications: </AppText>
              <Switch
                onValueChange={toggleSwitch}
                value={allowNotifications}
                trackColor={{ false: GRAY_5, true: PRIMARY_GREEN }}
              />
            </View>
            <AppText style={styles.title}>Notification Timing</AppText>
            <View style={styles.menuOptionContainer}>
              <AppText>Start Time: </AppText>
              <CustomTimeInput
                time={startTime}
                setTime={handleStartTimeChange}
              />
            </View>
            <View style={styles.menuOptionContainerBottom}>
              <AppText>End Time: </AppText>
              <CustomTimeInput time={endTime} setTime={handleEndTimeChange} />
            </View>
            <View style={styles.menuOptionContainerBottom}>
              <AppText>Time between notifications: </AppText>
              <View style={{ flexDirection: "row" }}>
                <TextInput
                  keyboardType="numeric"
                  style={styles.frequencyInput}
                  value={String(spacing)}
                  onChangeText={(text) => {
                    void handleSpacingChange(Number(text));
                  }}
                />
                <AppText>minute(s)</AppText>
              </View>
            </View>
            <AppText style={styles.title}>Notification Database</AppText>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(
                  strings.screenName.notificationSelectorScreen,
                );
              }}
            >
              <View style={styles.menuOptionContainerBottom}>
                <AppText>{`Current Notifications From: ${query}`}</AppText>
              </View>
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              {/* <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  void scheduleNotifications()
                    .then(async () => {
                      await handleButtonPress();
                    })
                    .catch((err) => {
                      console.error(err);
                      Alert.alert(err.toString());
                    });
                }}
              >
                <AppText style={styles.buttonText}>
                  {strings.copy.saveNotificationsButton}
                </AppText>
              </TouchableOpacity> */}
            </View>
          </View>
        </ScrollView>
      </View>

      <BottomNav
        navigation={navigation}
        screen={strings.screenName.settings}
        whatToInclude={IncludeInBottomNav.Nothing}
        playPressed={false}
        scrollSpeed={0}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    height: "100%",
    width: "100%",
  },
  title: {
    alignSelf: "center",
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "bold",
  },
  dataSelector: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
    width: 224,
    marginBottom: 17,
  },
  main: {
    backgroundColor: GRAY_6,
    height: Dimensions.get("window").height,
    width: "100%",
  },
  menuOptionContainer: {
    height: 60,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  menuOptionContainerBottom: {
    borderBottomColor: GRAY_5,
    borderBottomWidth: 0.5,
    marginBottom: 25,
    height: 60,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    width: "100%",
  },
  pullText: {
    fontSize: 10,
    color: GRAY_2,
    marginTop: -15,
    marginBottom: 20,
    marginLeft: 15,
  },
  button: {
    borderRadius: 10,
    backgroundColor: PRIMARY_GREEN,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 180,
    marginHorizontal: 10,
  },
  buttonText: {
    color: LIGHT,
    fontWeight: "bold",
  },
  frequencyInput: {
    width: 40,
    marginHorizontal: 10,
    backgroundColor: GRAY_6,
    textAlign: "center",
  },
});
