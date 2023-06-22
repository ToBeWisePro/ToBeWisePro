import React, { useState, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { strings } from "../../res/constants/Strings";
import {
  NavigationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import {
  GRAY_1,
  GRAY_2,
  GRAY_5,
  GRAY_6,
  LIGHT,
  PRIMARY_GREEN,
} from "../../../styles/Colors";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { TopNav } from "../molecules/TopNav";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { AppText } from "../atoms/AppText";
import { CustomTimeInput } from "../atoms/CustomTimeInput";
import { scheduleNotifications } from "../../res/util/NotificationScheduler";
import { NotificationDebugScreen } from "./NotificationDebugScreen";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const SETTINGS_KEYS = {
  allowNotifications: "allowNotifications",
  startTime: "startTime",
  endTime: "endTime",
  spacing: "spacing",
  query: "query",
  filter: "filter",
};

export const saveSettings = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const loadSettings = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    // save the default filter
    if (key === SETTINGS_KEYS.filter) {
      console.log("Setting default filter");
      await saveSettings(key, strings.database.defaultFilter);
    }
  }
  return null;
};

export const NotificationScreen: React.FC<Props> = ({
  navigation,
  route,
}: Props) => {
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [spacing, setSpacing] = useState(30);
  const [query, setQuery] = useState(strings.database.defaultQuery);
  const [filter, setFilter] = useState(strings.database.defaultFilter);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedSettings = async () => {
    const savedAllowNotifications = await loadSettings(
      SETTINGS_KEYS.allowNotifications
    );
    const savedStartTime = await loadSettings(SETTINGS_KEYS.startTime);
    const savedEndTime = await loadSettings(SETTINGS_KEYS.endTime);
    const savedSpacing = await loadSettings(SETTINGS_KEYS.spacing);
    const savedQuery = await loadSettings(SETTINGS_KEYS.query);
    const savedFilter = await loadSettings(SETTINGS_KEYS.filter);

    if (savedQuery !== null) {
      setQuery(savedQuery);
    }
    if (savedFilter !== null) {
      setFilter(savedFilter);
    }
    if (savedAllowNotifications !== null) {
      setAllowNotifications(savedAllowNotifications);
    }
    if (savedStartTime !== null) {
      setStartTime(new Date(savedStartTime));
    }
    if (savedEndTime !== null) {
      setEndTime(new Date(savedEndTime));
    }
    if (savedSpacing !== null) {
      setSpacing(savedSpacing);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadSavedSettings();
    });

    // Clean up the event listener on component unmount
    return unsubscribe;
  }, [navigation]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadSavedSettings();
    setRefreshing(false);
  }, []);

  const toggleSwitch = () => {
    const updatedAllowNotifications = !allowNotifications;
    setAllowNotifications(updatedAllowNotifications);
    saveSettings(SETTINGS_KEYS.allowNotifications, updatedAllowNotifications);
  };
  const isValidTimeRange = (start: Date, end: Date) => {
    if (start.getHours() < end.getHours()) {
      return true;
    } else if (start.getHours() === end.getHours()) {
      return start.getMinutes() <= end.getMinutes();
    }
    return false;
  };

  const handleStartTimeChange = (time: Date) => {
    if (isValidTimeRange(time, endTime)) {
      setStartTime(time);
      saveSettings(SETTINGS_KEYS.startTime, time);
    } else {
      alert(
        'Start Time "${time.toLocaleTimeString()}" must be less than or equal to End Time "${endTime.toLocaleTimeString()}".'
      );
    }
  };

  const handleEndTimeChange = (time: Date) => {
    if (isValidTimeRange(startTime, time)) {
      setEndTime(time);
      saveSettings(SETTINGS_KEYS.endTime, time);
      scheduleNotifications();
    } else {
      alert(
        'End Time "${time.toLocaleTimeString()}" must be greater than or equal to Start Time "${startTime.toLocaleTimeString()}".'
      );
    }
  };

  const handleSpacingChange = async (value: number) => {
    await saveSettings(SETTINGS_KEYS.spacing, value).then(async () => {
      setSpacing(value);
      await scheduleNotifications()
        .then(() => console.log("notifs scheduled"))
        .catch((err) => console.log(err));
    });
  };

  return (
    <View style={styles.container}>
      <TopNav
        backButton={true}
        backFunction={() => navigation.goBack()}
        title={strings.screenName.notificationsScreen}
        stickyHeader={true}
      />
      <View style={{ backgroundColor: LIGHT }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}

          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
        >
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
                  onChangeText={async (text) =>
                    await handleSpacingChange(Number(text))
                  }
                />
                <AppText>minute(s)</AppText>
              </View>
            </View>
            <AppText style={styles.title}>Notification Database</AppText>
            <TouchableOpacity
              onPress={() =>
                navigation.push(
                  strings.screenName.notificationSelectorScreen,
                  {}
                )
              }
            >
              <View style={styles.menuOptionContainerBottom}>
                <AppText>{`Current Notifications From: ${query}`}</AppText>
              </View>
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                style={styles.button}
                onPress={async () =>
                  await scheduleNotifications()
                    .then(() => Alert.alert(strings.copy.newNotificationsSet))
                    .catch((err) => {
                      console.error(err);
                      Alert.alert(err.toString());
                    })
                }
              >
                <AppText style={styles.buttonText}>
                  {strings.copy.saveNotificationsButton}
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
