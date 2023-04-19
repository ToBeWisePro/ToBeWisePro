import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { strings } from "../../res/constants/Strings";
import {
  NavigationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { GRAY_6 } from "../../../styles/Colors";

import { NotificationsMenuOption } from "../molecules/NotificationsMenuOption";
import { NotificationsMenuOptionEnum } from "../../res/constants/Enums";
import { NotificationsMenuOptionProps } from "../../res/constants/Interfaces";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { TopNav } from "../molecules/TopNav";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export enum Frequencies {
  "15 Minutes",
  "30 Minutes",
  "1 Hour",
  "2 Hours",
  "4 Hours",
  "6 Hours",
}

const loadSettings = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      if (key === "allowNotifications") {
        return value === "true";
      }
      return value;
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
  const [notificationDB, setNotificationDB] = useState("default");

  useEffect(() => {
    (async () => {
      const savedAllowNotifications = await loadSettings("allowNotifications");
      const savedStartTime = await loadSettings("startTime");
      const savedEndTime = await loadSettings("endTime");
      const savedFrequency = await loadSettings("frequency");
      const savedNotificationDB = await loadSettings("notificationDB");

      if (savedAllowNotifications !== null) {
        setAllowNotifications(savedAllowNotifications);
      }
      if (savedStartTime) {
        setStartTime(new Date(savedStartTime));
      }
      if (savedEndTime) {
        setEndTime(new Date(savedEndTime));
      }
      if (savedFrequency) {
        setFrequency(savedFrequency);
      }
      if (savedNotificationDB) {
        setNotificationDB(savedNotificationDB);
      }
    })();
  }, []);

  const toggleSwitch = () =>
    setAllowNotifications((previousState) => !previousState);

  const menu: NotificationsMenuOptionProps[] = [
    {
      notificationsMenuOptionEnum: NotificationsMenuOptionEnum.Toggle,
      label: "Allow Notifications",
      state: allowNotifications,
      toggleFunction: toggleSwitch,
      bottomLine: true,
    },
    {
      notificationsMenuOptionEnum: NotificationsMenuOptionEnum.TimeSelector,
      label: "Notification Start Time",
      state: startTime,
      setState: setStartTime,
      bottomLine: false,
    },
    {
      notificationsMenuOptionEnum: NotificationsMenuOptionEnum.TimeSelector,
      label: "Notification End Time",
      state: endTime,
      setState: setEndTime,
      bottomLine: true,
    },
    {
      notificationsMenuOptionEnum:
        NotificationsMenuOptionEnum.FrequencySelector,
      label: "Frequency",
      state: frequency,
      setState: setFrequency,
      bottomLine: true,
    },
    {
      notificationsMenuOptionEnum: NotificationsMenuOptionEnum.DBSelector,
      label: "Select Notification Database",
      state: notificationDB,
      setState: setNotificationDB,
      bottomLine: true,
    },
  ];

  return (
    <View style={styles.container}>
      <TopNav
        backButton={true}
        backFunction={() => navigation.goBack()}
        title={strings.screenName.notificationsScreen}
        stickyHeader={true}
      />
      <View style={styles.main}>
        <FlatList
          data={menu}
          renderItem={(item) => (
            <NotificationsMenuOption
              key={item.index} // Add this line
              notificationsMenuOptionEnum={
                item.item.notificationsMenuOptionEnum
              }
              label={item.item.label}
              state={item.item.state}
              toggleFunction={item.item.toggleFunction}
              setState={item.item.setState}
              bottomLine={item.item.bottomLine}
            />
          )}
        />
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
});
