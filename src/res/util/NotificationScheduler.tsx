import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { ASYNC_KEYS } from "../constants/Enums";

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

    // console.debug(`Notifications Start Time: ${startTime}`);
    // console.debug(`Notifications End Time: ${endTime}`);
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

      const currentDate = new Date();
      const fireDate = new Date();

      // If current time is after the end time, set the fireDate to the next day's start time
      if (currentDate.getHours() * 100 + currentDate.getMinutes() > endTime) {
        fireDate.setDate(currentDate.getDate() + 1); // Move to next day
        fireDate.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0); // Set to start time
      } else if (
        currentDate.getHours() * 100 + currentDate.getMinutes() <
        startTime
      ) {
        // If before the start time, set to the start time of the same day
        fireDate.setHours(Math.floor(startTime / 100), startTime % 100, 0, 0); // Set to start time
      }

      for (let i = 0; i < quotes.length && i < MAX_INTERVALS; i++) {
        // Only schedule if within the window
        if (
          fireDate.getHours() * 100 + fireDate.getMinutes() >= startTime &&
          fireDate.getHours() * 100 + fireDate.getMinutes() <= endTime
        ) {
          const quote = quotes[i];
          if (quote.quoteText.length > 0) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            // console.debug(`Scheduled notification at ${fireDate}`);
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "ToBeWise",
                body: quote.quoteText + "\n-" + quote.author,
                data: { quote },
              },
              trigger: { date: fireDate.getTime() },
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
}
