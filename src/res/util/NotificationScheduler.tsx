import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { strings } from "../constants/Strings";

export async function scheduleNotifications() {
  let allowNotifications = true;

  try {
    const value = await AsyncStorage.getItem("allowNotifications");
    if (value !== null) {
      allowNotifications = JSON.parse(value);
    }
  } catch (error) {
    console.error("Error loading allowNotifications setting:", error);
  }

  const adjustDate = (date) => {
    const today = new Date();
    date.setFullYear(today.getFullYear());
    date.setMonth(today.getMonth());
    date.setDate(today.getDate());
    return date;
  };

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
  const now = new Date();

  // add 10 seconds to now for the first notification
  let firstFireTime = new Date(now.getTime() + 10 * 1000);

  if (allowNotifications) {
    let i = 0
    while (i <= 63) {
      // Use firstFireTime for the first notification, then add INTERVAL for subsequent notifications
      const fireDate =
        i === 0
          ? firstFireTime
          : new Date(firstFireTime.getTime() + i * INTERVAL);

      if (fireDate >= startTime && fireDate <= endTime) {
        const quote = await getShuffledQuotes(query, filter).then(async (quote) => {
          if (quote[0].quoteText.length > 0) {
            console.log(`Scheduling notification with date: ${fireDate}`); // Log the fireDate
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "ToBeWise",
                  body: quote[0].quoteText + "\n\n-" + quote[0].author,
                  data: {
                    quote: quote[0],
                  },
                },
                trigger: {
                  date: fireDate.getTime(), // convert Date object to milliseconds
                },
              }).then(() => {
                i++;
              });
            } catch (e) {
              console.error("Error scheduling notification:", e);
            }
          } else {
            throw Error;
          }
        });
      }
    }

    const finalFireDate = new Date(firstFireTime.getTime() + 64 * INTERVAL);

    console.log(`Scheduling final notification with date: ${finalFireDate}`); // Log the finalFireDate
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "ToBeWise",
        body: "Open ToBeWise to queue more notifications",
      },
      trigger: {
        date: finalFireDate.getTime(), // converting Date object to milliseconds
      },
    });
  }
}
