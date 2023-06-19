import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import * as Notifications from "expo-notifications";
import { TopNav } from "../molecules/TopNav";
import { NavigationInterface } from "../../res/constants/Interfaces";

interface Props {
  navigation: NavigationInterface;
}

export const NotificationDebugScreen = ({ navigation }: Props) => {
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchScheduledNotifications();
  }, []);

  const fetchScheduledNotifications = async () => {
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    notifications.forEach((notification) => {
      console.log(
        `Received notification with trigger: ${JSON.stringify(
          notification.trigger,
          null,
          2
        )}`
      ); // Log trigger object directly
    });
    setScheduledNotifications(notifications);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScheduledNotifications();
  }, []);

  return (
    <View>
      <TopNav
        title="Notification Debug"
        stickyHeader={true}
        backButton={true}
        backFunction={() => navigation.goBack()}
      />
      <ScrollView
        style={{ marginBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {scheduledNotifications.map((notification, index) => {
          // console.log(`Received notification with date: ${notification.trigger.date}`); // Log trigger date
          const triggerDate = new Date(notification.trigger.date);
          const formattedDate = triggerDate.toString();

          return (
            <View key={index}>
              <Text>Title: {notification.content.title}</Text>
              <Text>Body: {notification.content.body}</Text>
              <Text>
                "Trigger: " {JSON.stringify(notification.trigger, null, 2)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default NotificationDebugScreen;
