import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { strings } from "../../res/constants/Strings";
import {
  NavigationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import {
  GRAY_4,
  GRAY_5,
  GRAY_6,
  LIGHT,
  PRIMARY_GREEN,
} from "../../../styles/Colors";

import { NotificationsMenuOption } from "../molecules/NotificationsMenuOption";
import { NotificationsMenuOptionEnum } from "../../res/constants/Enums";
import { NotificationsMenuOptionProps } from "../../res/constants/Interfaces";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { TopNav } from "../molecules/TopNav";
import { Switch } from "react-native-gesture-handler";
import { AppText } from "../atoms/AppText";
import { CustomTimeInput } from "../atoms/CustomTimeInput";
import { NotificationFrequencySelector } from "../atoms/NotificationFrequencySelector";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const Frequencies = {
  "15 Minutes": "15 Minutes",
  "30 Minutes": "30 Minutes",
  "1 Hour": "1 Hour",
  "2 Hours": "2 Hours",
  "4 Hours": "4 Hours",
  "6 Hours": "6 Hours",
};

const SETTINGS_KEYS = {
  allowNotifications: "allowNotifications",
  startTime: "startTime",
  endTime: "endTime",
  frequency: "frequency",
};

const saveSettings = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

const loadSettings = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error("Error loading settings:", error);
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
  const [frequency, setFrequency] = useState(Frequencies["1 Hour"]);

  useEffect(() => {
    const loadSavedSettings = async () => {
      const savedAllowNotifications = await loadSettings(
        SETTINGS_KEYS.allowNotifications
      );
      const savedStartTime = await loadSettings(SETTINGS_KEYS.startTime);
      const savedEndTime = await loadSettings(SETTINGS_KEYS.endTime);
      const savedFrequency = await loadSettings(SETTINGS_KEYS.frequency);

      if (savedAllowNotifications !== null) {
        setAllowNotifications(savedAllowNotifications);
      }
      if (savedStartTime !== null) {
        setStartTime(new Date(savedStartTime));
      }
      if (savedEndTime !== null) {
        setEndTime(new Date(savedEndTime));
      }
      if (savedFrequency !== null) {
        setFrequency(savedFrequency);
      }
    };
    loadSavedSettings();
  }, []);

  const toggleSwitch = () => {
    const updatedAllowNotifications = !allowNotifications;
    setAllowNotifications(updatedAllowNotifications);
    saveSettings(SETTINGS_KEYS.allowNotifications, updatedAllowNotifications);
  };

  const handleStartTimeChange = (time: Date) => {
    setStartTime(time);
    saveSettings(SETTINGS_KEYS.startTime, time);
  };

  const handleEndTimeChange = (time: Date) => {
    setEndTime(time);
    saveSettings(SETTINGS_KEYS.endTime, time);
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    saveSettings(SETTINGS_KEYS.frequency, value);
  };

  return (
    <View style={styles.container}>
      <TopNav
        backButton={true}
        backFunction={() => navigation.goBack()}
        title={strings.screenName.notificationsScreen}
        stickyHeader={true}
      />
      <View style={styles.main}>
        <View style={styles.menuOptionContainerBottom}>
          <AppText>Allow Notifications</AppText>
          <Switch
            onValueChange={toggleSwitch}
            value={allowNotifications}
            trackColor={{ false: GRAY_5, true: PRIMARY_GREEN }}
          />
        </View>
        <View style={styles.menuOptionContainer}>
          <AppText>Start Time</AppText>
          <CustomTimeInput time={startTime} setTime={handleStartTimeChange} />
        </View>
        <View style={styles.menuOptionContainerBottom}>
          <AppText>End Time</AppText>
          <CustomTimeInput time={endTime} setTime={handleEndTimeChange} />
        </View>
        <View style={styles.menuOptionContainerBottom}>
          <AppText>Frequency</AppText>
          <NotificationFrequencySelector
            state={frequency}
            setState={handleFrequencyChange}
          />
        </View>
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
  main: {
    backgroundColor: GRAY_6,
    height: "100%",
    width: "100%",
  },
  menuOptionContainer: {
    height: 40,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    justifyContent: "space-between",
  },
  menuOptionContainerBottom: {
    borderBottomColor: GRAY_5,
    borderBottomWidth: 0.5,
    marginBottom: 25,
    height: 40,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    justifyContent: "space-between",
  },
});
