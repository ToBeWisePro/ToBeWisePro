import React, { useState, useEffect } from "react";
import {
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
  type RouteInterface,
} from "../../res/constants/Interfaces";
import {
  GRAY_2,
  GRAY_3,
  GRAY_5,
  GRAY_6,
  LIGHT,
  PRIMARY_GREEN,
} from "../../../styles/Colors";
import RNPickerSelect from "react-native-picker-select";
import { BottomNav } from "../organisms/BottomNav";
import { ASYNC_KEYS, IncludeInBottomNav } from "../../res/constants/Enums";
import { TopNav } from "../molecules/TopNav";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { AppText } from "../atoms/AppText";
import { CustomTimeInput } from "../atoms/CustomTimeInput";
import { scheduleNotifications } from "../../res/util/NotificationScheduler";
import { TEST_IDS } from "../../res/constants/TestIDs";
import * as Notifications from "expo-notifications";
import { convertTo12HourFormat } from "../../res/functions/UtilFunctions";
import ReactHapticFeedback from "react-native-haptic-feedback"; // <-- Import the module

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

export const saveChangesAndScheduleNotifications = async (
  allowNotifications: boolean,
  startTime: number,
  endTime: number,
  spacing: number,
): Promise<void> => {
  try {
    await saveSettings(ASYNC_KEYS.allowNotifications, allowNotifications);
    await saveSettings(ASYNC_KEYS.startTime24h, startTime);
    await saveSettings(ASYNC_KEYS.endTime24h, endTime);
    await saveSettings(ASYNC_KEYS.spacing, spacing);
    await scheduleNotifications();
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const nextNotification = scheduledNotifications
      .slice(0, 1)
      .map((notification) => {
        if ("seconds" in notification.trigger) {
          return new Date(
            new Date().getTime() + notification.trigger.seconds * 1000,
          ).toLocaleString();
        } else {
          return "Notification trigger does not have a seconds property";
        }
      })
      .join("\n");

    console.debug(
      "Next Notification",
      nextNotification.length > 0
        ? nextNotification
        : "No Notifications Scheduled",
    );

    if (nextNotification.length > 0) {
      // if the current time (in 24 h format) is between the start and end time, let them know notifs are beginning now. If not, let the user know when they will start
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentMinuteOfDay = currentHour * 60 + currentMinute;
      const startTimeHour = Math.floor(startTime / 100);
      const startTimeMinute = startTime % 100;
      const startTimeMinuteOfDay = startTimeHour * 60 + startTimeMinute;
      const endTimeHour = Math.floor(endTime / 100);
      const endTimeMinute = endTime % 100;
      const endTimeMinuteOfDay = endTimeHour * 60 + endTimeMinute;
      if (
        currentMinuteOfDay >= startTimeMinuteOfDay &&
        currentMinuteOfDay <= endTimeMinuteOfDay
      ) {
        Alert.alert(strings.copy.newNotificationsSet);
      } else {
        const minutesDiff = startTimeMinuteOfDay - currentMinuteOfDay;
        if (minutesDiff > 0) {
          const hours = Math.floor(minutesDiff / 60);
          const minutes = minutesDiff % 60;
          Alert.alert(
            `Notifications will begin in ${hours} hour(s) and ${minutes} minute(s).`,
          );
        } else {
          const formattedStartTime = convertTo12HourFormat(
            startTimeHour,
            startTimeMinute,
          );
          Alert.alert(
            `Notifications will start tomorrow at ${formattedStartTime.hour}:${formattedStartTime.minute} ${formattedStartTime.period}.`,
          );
        }
      }
    }
  } catch (error) {
    console.error("Error fetching scheduled notifications:", error);
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
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadSavedSettings = async (): Promise<void> => {
    if (hasUnsavedChanges) return; // If there are unsaved changes, don't reload settings from AsyncStorage.

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

    // Run it once initially
    void loadSavedSettings();

    // Clean up the event listener on component unmount
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const passedQuery: string = route.params?.quoteSearch?.query ?? "";
      if (passedQuery.length > 0) {
        setQuery(passedQuery);
      } else {
        void loadSavedSettings();
      }
    });

    // Run it once initially
    void loadSavedSettings();

    // Clean up the event listener on component unmount
    return unsubscribe;
  }, [navigation, route.params]);

  const isValidTimeRange = (start: number, end: number): boolean => {
    return start <= end;
  };

  const toggleSwitch = (): void => {
    const updatedAllowNotifications = !allowNotifications;
    if (updatedAllowNotifications !== allowNotifications) {
      setSettingsChanged(true);
      setHasUnsavedChanges(true);
    }
    setAllowNotifications(updatedAllowNotifications);
  };

  const handleStartTimeChange = (time: number): void => {
    if (isValidTimeRange(time, endTime)) {
      if (time !== startTime) {
        setSettingsChanged(true);
        setHasUnsavedChanges(true);
      }
      setStartTime(time);
    } else {
      alert(`Start Time must be less than or equal to End Time.`);
    }
  };

  const handleEndTimeChange = (time: number): void => {
    if (isValidTimeRange(startTime, time)) {
      if (time !== endTime) {
        setSettingsChanged(true);
        setHasUnsavedChanges(true);
      }
      setEndTime(time);
    } else {
      alert(`End Time must be greater than or equal to Start Time.`);
    }
  };

  const handleSpacingChange = (value: number): void => {
    if (value !== spacing) {
      setSettingsChanged(true);
      setHasUnsavedChanges(true);
    }
    setSpacing(value);
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
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  placeholder={{}}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onValueChange={async (value) => {
                    handleSpacingChange(value);
                  }}
                  items={Array.from({ length: 60 }, (_, i) => ({
                    label: String(i + 1),
                    value: i + 1,
                  }))}
                  value={spacing}
                  style={pickerSelectStyles}
                />
                <View style={styles.textContainer}>
                  <AppText>minute(s)</AppText>
                </View>
              </View>
            </View>
            <AppText style={styles.title}>Notification Database</AppText>
            <TouchableOpacity
              onPress={() => {
                navigation.push(strings.screenName.notificationSelectorScreen, {
                  currentAllowNotifications: allowNotifications,
                  currentStartTime: startTime,
                  currentEndTime: endTime,
                  currentSpacing: spacing,
                  currentQuery: query,
                  notifyChange: () => {
                    setSettingsChanged(true);
                    setHasUnsavedChanges(true);
                  },
                });
              }}
            >
              <View style={styles.menuOptionContainerBottom}>
                <AppText>{`Current Notifications From: ${query}`}</AppText>
              </View>
            </TouchableOpacity>

            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                disabled={!settingsChanged}
                style={[
                  styles.notificationButton,
                  {
                    backgroundColor: settingsChanged ? PRIMARY_GREEN : GRAY_3,
                  },
                ]}
                onPress={() => {
                  ReactHapticFeedback.trigger("notificationSuccess", {
                    enableVibrateFallback: true,
                    ignoreAndroidSystemSettings: false,
                  });
                  void saveChangesAndScheduleNotifications(
                    allowNotifications,
                    startTime,
                    endTime,
                    spacing,
                  );
                }}
              >
                <AppText style={{ color: LIGHT }}>
                  Save Changes & Begin Notifications
                </AppText>
              </TouchableOpacity>
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
  notificationButton: {
    width: 270,
    height: 50,

    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: "center",
  },
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
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center", // Aligns children vertically in the center
    justifyContent: "flex-end", // Aligns children to the end of the container
  },

  textContainer: {
    marginLeft: 10, // Adds some space between the picker and the text
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingRight: 30, // to ensure the text is never behind the icon
    backgroundColor: GRAY_6,
    marginRight: 10,
    height: 30, // Adjusted height
    borderRadius: 8,
    alignSelf: "center",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
