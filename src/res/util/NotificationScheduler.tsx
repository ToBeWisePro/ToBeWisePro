import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { strings } from "../constants/Strings";

export const NotificationScheduler: React.FC<{ reinitialize: number }> = ({
  reinitialize,
}) => {
  const [allowNotifications, setAllowNotifications] = useState(true);

  const loadAllowNotifications = async () => {
    try {
      const value = await AsyncStorage.getItem("allowNotifications");
      if (value !== null) {
        setAllowNotifications(JSON.parse(value));
      }
    } catch (error) {
      console.error("Error loading allowNotifications setting:", error);
    }
  };

  useEffect(() => {
    loadAllowNotifications();
  }, [reinitialize]);

  useEffect(() => {
    const adjustDate = (date: Date) => {
      const today = new Date();
      date.setFullYear(today.getFullYear());
      date.setMonth(today.getMonth());
      date.setDate(today.getDate());
      return date;
    };

    const presentNotifications = async () => {
      const startTimeValue = await AsyncStorage.getItem("startTime");
      const startTime = adjustDate(
        new Date(startTimeValue ? JSON.parse(startTimeValue) : new Date())
      );

      const endTimeValue = await AsyncStorage.getItem("endTime");
      const endTime = adjustDate(
        new Date(endTimeValue ? JSON.parse(endTimeValue) : new Date())
      );

      const queryValue = await AsyncStorage.getItem("query");
      const filterValue = await AsyncStorage.getItem("filter");
      const spacingValue = await AsyncStorage.getItem("spacing");

      const query = queryValue
        ? JSON.parse(queryValue)
        : strings.database.defaultQuery;
      const filter = filterValue
        ? JSON.parse(filterValue)
        : strings.database.defaultFilter;
      const spacing = spacingValue ? JSON.parse(spacingValue) : 30;
      const INTERVAL = spacing * 60 * 1000;
      const timeouts = [];
      const now = new Date();

      if (allowNotifications) {
        for (let i = 1; i <= 63; i++) {
          if (now >= startTime && now <= endTime) {
            const timeout = setTimeout(async () => {
              const quote = await getShuffledQuotes(query, filter);
              console.log("Quote:", quote);
              await Notifications.presentNotificationAsync({
                title: quote[0].author,
                body: quote[0].quoteText,
              });

              // Debugging Information
              const fireTime = new Date(now.getTime() + i * INTERVAL);
              console.log(`Scheduled notification #${i}:`);
              console.log(`Title: ${quote[0].author}`);
              console.log(`Body: ${quote[0].quoteText}`);
              console.log(`Will fire at: ${fireTime.toString()}`);
            }, i * INTERVAL);
            timeouts.push(timeout);
          }
        }

        const timeout = setTimeout(async () => {
          await Notifications.presentNotificationAsync({
            title: "ToBeWise",
            body: "Open ToBeWise to queue more notifications",
          });

          // Debugging Information
          const fireTime = new Date(now.getTime() + 64 * INTERVAL);
          console.log(`Scheduled final notification:`);
          console.log(`Title: ToBeWise`);
          console.log(`Body: Open ToBeWise to queue more notifications`);
          console.log(`Will fire at: ${fireTime.toString()}`);
        }, 64 * INTERVAL);
        timeouts.push(timeout);
      }

      return timeouts;
    };

    let timeouts: any[] = [];

    (async () => {
      timeouts = await presentNotifications();
    })();

    return () => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, [reinitialize, allowNotifications]);

  return <></>;
};
