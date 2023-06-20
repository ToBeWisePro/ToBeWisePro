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
    const schedulingMoment = Date.now(); // Save the scheduling time
    const notifications =
      await Notifications.getAllScheduledNotificationsAsync();
    notifications.forEach((notification) => {
      // console.log(
      //   `Received notification with trigger: ${JSON.stringify(
      //     notification.trigger,
      //     null,
      //     2
      //   )}`
      // ); // Log trigger object directly
    });

    const notificationsWithFireTime = notifications.map(notification => {
      if (notification.trigger && typeof notification.trigger.seconds === 'number') {
        const fireTime = new Date(schedulingMoment + notification.trigger.seconds * 1000);
        return {...notification, fireTime};
      }
      return notification; // return the notification as is if it doesn't have a seconds property
    });

    setScheduledNotifications(notificationsWithFireTime);
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
          const formattedFireTime = notification.fireTime ? notification.fireTime.toLocaleString() : 'N/A';

          return (
            <View key={index} style={{marginBottom: 50, borderColor: "#000", borderWidth: 1}}>
              <Text>Title: {notification.content.title}</Text>
              <Text>Body: {notification.content.body}</Text>
              <Text>
                "Trigger: " {JSON.stringify(notification.trigger, null, 2)}
              </Text>
              <Text>
                "Expected Fire Time: " {formattedFireTime}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default NotificationDebugScreen;
