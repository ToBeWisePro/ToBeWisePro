import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { ASYNC_KEYS } from "../constants/Enums";
import { Alert } from "react-native";

export async function scheduleNotifications(): Promise<void> {
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

  if (allowNotifications && spacing > 0) {
    try {
      const quotes = await getShuffledQuotes(true);
      let fireDate = new Date();

      // Ensure fireDate is set to the next available start time
      const currentTime = fireDate.getHours() * 100 + fireDate.getMinutes();
      if (currentTime >= endTime) {
        fireDate.setDate(fireDate.getDate() + 1); // Move to next day
        fireDate.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0); // Set to start time
      } else if (currentTime < startTime) {
        fireDate.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0); // Set to start time
      } else {
        // If current time is within the allowed window, adjust fireDate to the next spacing interval
        const nextInterval =
          Math.ceil(
            (fireDate.getMinutes() * 1000 * 60) / spacingInMilliseconds,
          ) * spacingInMilliseconds;
        fireDate = new Date(
          fireDate.getTime() - fireDate.getMinutes() * 1000 * 60 + nextInterval,
        );
      }

      for (let i = 0; i < quotes.length && i < MAX_INTERVALS; i++) {
        // Only schedule if within the window
        if (
          fireDate.getHours() * 100 + fireDate.getMinutes() >= startTime &&
          fireDate.getHours() * 100 + fireDate.getMinutes() <= endTime
        ) {
          const quote = quotes[i];
          if (quote.quoteText.length > 0) {
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

            fireDate.setTime(fireDate.getTime() + spacingInMilliseconds); // Increment fireDate by spacing

            // If it's outside the allowed window, move to the start time of the next day
            if (fireDate.getHours() * 100 + fireDate.getMinutes() > endTime) {
              fireDate.setDate(fireDate.getDate() + 1);
              fireDate.setHours(
                Math.floor(startTime / 100),
                startTime % 100,
                0,
                0,
              ); // Reset to start time
            }
          } else {
            throw Error("Empty quote text");
          }
        }
      }
    } catch (error) {
      console.error("Error during getShuffledQuotes", error);
    }
  }

  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    const nextThreeNotifications = scheduledNotifications
      .slice(0, 3)
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

    Alert.alert(
      "Next 3 Notifications",
      nextThreeNotifications.length > 0
        ? nextThreeNotifications
        : "No Notifications Scheduled",
    );
  } catch (error) {
    console.error("Error fetching scheduled notifications:", error);
  }
}
