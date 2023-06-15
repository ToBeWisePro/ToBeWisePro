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

  if (allowNotifications) {
    // Schedule immediate notification
    const immediateQuote = await getShuffledQuotes(query, filter);
    if (immediateQuote[0].quoteText.length > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: immediateQuote[0].author,
          body: immediateQuote[0].quoteText,
          data: {
            quote: immediateQuote[0],  // send the quote as data
          },
        },
        trigger: null, // triggers immediate notification
      });
    } else {
      throw Error;
    }

    for (let i = 2; i <= 63; i++) {  // start from 2, as the first notification is already scheduled
      const fireDate = new Date(now.getTime() + i * INTERVAL);
      if (fireDate >= startTime && fireDate <= endTime) {
        const quote = await getShuffledQuotes(query, filter);
        if (quote[0].quoteText.length > 0) {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: quote[0].author,
                body: quote[0].quoteText,
                data: {
                  quote: quote[0],  // send the quote as data
                },
              },
              trigger: {
                date: fireDate,
              },
            });
          } catch (e) {
            console.error("Error scheduling notification:", e);
          }
        } else {
          throw Error;
        }

        if (i < 5) {
          // Debugging Information
          console.log(`Scheduled notification #${i}:`);
          console.log(`Title: ${quote[0].author}`);
          console.log(`Body: ${quote[0].quoteText}`);
          console.log(`Will fire at: ${fireDate.toString()}`);
        }

        if (i == 5) {
          console.log("Truncating notification output...");
        }
      }
    }

    const finalFireDate = new Date(now.getTime() + 64 * INTERVAL);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "ToBeWise",
        body: "Open ToBeWise to queue more notifications",
      },
      trigger: {
        date: finalFireDate,
      },
    });

    // Debugging Information
    console.log(`Scheduled final notification:`);
    console.log(`Title: ToBeWise`);
    console.log(`Body: Open ToBeWise to queue more notifications`);
    console.log(`Will fire at: ${finalFireDate.toString()}`);
  }
}
