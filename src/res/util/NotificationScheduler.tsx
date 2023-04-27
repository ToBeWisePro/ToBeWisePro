import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getShuffledQuotes } from '../functions/DBFunctions';
import { strings } from '../constants/Strings';

const INTERVAL = (60*30) * 1000; // 1 minute in milliseconds

export const NotificationScheduler: React.FC = () => {
  useEffect(() => {
    const adjustDate = (date: Date) => {
      const today = new Date();
      date.setFullYear(today.getFullYear());
      date.setMonth(today.getMonth());
      date.setDate(today.getDate());
      return date;
    };

    const presentNotifications = async () => {
      const startTime = adjustDate(
        new Date(
          JSON.parse(await AsyncStorage.getItem('startTime')) ?? new Date()
        )
      );
      const endTime = adjustDate(
        new Date(
          JSON.parse(await AsyncStorage.getItem('endTime')) ?? new Date()
        )
      );
      const query =
        JSON.parse(await AsyncStorage.getItem('query')) ??
        strings.database.defaultQuery;
      const filter =
        JSON.parse(await AsyncStorage.getItem('filter')) ??
        strings.database.defaultFilter;

      for (let i = 1; i <= 63; i++) {
        const now = new Date();
        if (now >= startTime && now <= endTime) {
          setTimeout(async () => {
            const quote = await getShuffledQuotes(query, filter);
            await Notifications.presentNotificationAsync({
              title: quote[0].author,
              body: quote[0].quoteText,
            });
          }, i * INTERVAL);
        }
      }

      setTimeout(async () => {
        await Notifications.presentNotificationAsync({
          title: 'ToBeWise',
          body: 'Open ToBeWise to queue more notifications',
        });
      }, 64 * INTERVAL);
    };

    presentNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        presentNotifications();
      }
    );

    return () => {
      subscription.remove();
      // Cancel any remaining setTimeout calls when the component is unmounted
      for (let i = 1; i <= 64; i++) {
        clearTimeout(i);
      }
    };
  }, []);

  return null;
};
