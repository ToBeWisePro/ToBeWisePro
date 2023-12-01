import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../../backend/DBFunctions";
import { ASYNC_KEYS } from "../constants/Enums";

export async function scheduleNotifications(
  testQuery?: string,
  testFilter?: string,
): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error cancelling old notifications:", error);
  }

  let allowNotifications = true;
  try {
    const value = await AsyncStorage.getItem(ASYNC_KEYS.allowNotifications);
    if (value !== null) allowNotifications = JSON.parse(value);
  } catch (error) {
    console.error("Error loading allowNotifications setting:", error);
  }

  let startTime = 900;
  let endTime = 1700;
  try {
    const startTimeString = await AsyncStorage.getItem(ASYNC_KEYS.startTime24h);
    const endTimeString = await AsyncStorage.getItem(ASYNC_KEYS.endTime24h);
    if (startTimeString != null) startTime = parseInt(startTimeString, 10);
    if (endTimeString != null) endTime = parseInt(endTimeString, 10);
  } catch (error) {
    console.error("Error loading start and end times:", error);
  }

  const spacingValue = await AsyncStorage.getItem(ASYNC_KEYS.spacing);
  const spacing = spacingValue != null ? JSON.parse(spacingValue) : 30;
  const ONE_MINUTE = 60 * 1000;
  const MAX_INTERVALS = 60;
  const spacingInMilliseconds = spacing * ONE_MINUTE;

  if (testQuery != null) {
    await AsyncStorage.setItem(ASYNC_KEYS.notificationQuery, testQuery);
  }
  if (testFilter != null) {
    await AsyncStorage.setItem(ASYNC_KEYS.notificationFilter, testFilter);
  }

  if (allowNotifications && spacing > 0) {
    try {
      const quotes = await getShuffledQuotes(true);
      let fireDate = new Date();

      const currentTime = fireDate.getHours() * 100 + fireDate.getMinutes();
      if (currentTime >= endTime) {
        fireDate.setDate(fireDate.getDate() + 1);
        fireDate.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0);
      } else if (currentTime < startTime) {
        fireDate.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0);
      } else {
        const nextInterval =
          Math.ceil(
            (fireDate.getMinutes() * ONE_MINUTE) / spacingInMilliseconds,
          ) * spacingInMilliseconds;
        fireDate = new Date(
          fireDate.getTime() -
            fireDate.getMinutes() * ONE_MINUTE +
            nextInterval,
        );
      }

      let scheduledNotifications = 0;

      for (
        let i = 0;
        i < quotes.length && scheduledNotifications < MAX_INTERVALS - 1;
        i++
      ) {
        const quote = quotes[i];
        if (quote.quoteText.length > 0) {
          while (fireDate.getTime() <= new Date().getTime()) {
            fireDate.setTime(fireDate.getTime() + spacingInMilliseconds);
          }

          await Notifications.scheduleNotificationAsync({
            content: {
              title: "ToBeWise",
              body: quote.quoteText + "\n-" + quote.author,
              data: { quote },
            },
            trigger: {
              seconds: (fireDate.getTime() - new Date().getTime()) / 1000,
            },
          });

          scheduledNotifications++;
          fireDate.setTime(fireDate.getTime() + spacingInMilliseconds);
          if (fireDate.getHours() * 100 + fireDate.getMinutes() > endTime) {
            fireDate.setDate(fireDate.getDate() + 1);
            fireDate.setHours(
              Math.floor(startTime / 100),
              startTime % 100,
              0,
              0,
            );
          }
        }
      }

      // Always add the final notification if there's space
      if (scheduledNotifications < MAX_INTERVALS) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "ToBeWise",
            body: "Open ToBeWise To Schedule More Notifications",
          },
          trigger: {
            seconds: (fireDate.getTime() - new Date().getTime()) / 1000,
          },
        });
      }
    } catch (error) {
      console.error("Error during getShuffledQuotes", error);
    }
  }
}
