import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { strings } from "../constants/Strings";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  // Adjust the start time to be one interval from the current time
  const startTime = new Date(Date.now() + INTERVAL);

  if (allowNotifications) {
    // get shuffled quotes once
    const quotes = await getShuffledQuotes(query, filter);
    if (quotes.length === 0) {
      throw Error("No quotes available");
    }

    // calculate the number of intervals between the start and end time
    const totalIntervals = Math.floor(
      (24 * 60 * 60 * 1000 - INTERVAL) / INTERVAL
    );

    const notificationRequests = []; // Array to store all notification requests

    let prevFireTime = 0; // Add this line before the loop

    for (let i = 0; i <= totalIntervals; i++) {
      const fireDate = new Date(startTime.getTime() + i * INTERVAL);

      // pick a random quote from the shuffled quotes
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      if (quote.quoteText.length > 0) {
        // Check if the fire time is less than or equal to the previous fire time + 5 seconds
        if (fireDate.getTime() <= prevFireTime + 5000) {
          console.log('Two quotes found that are scheduled too close together. Skipping one.');
          continue; // Skip this iteration and move to the next
        }
        prevFireTime = fireDate.getTime(); // Set the new previous fire time

        // Add each notification request to the array
        notificationRequests.push({
          content: {
            title: "ToBeWise",
            body: quote.quoteText + "\n\n-" + quote.author,
            data: {
              quote: quote,
            },
          },
          trigger: {
            date: fireDate.getTime(), // convert Date object to milliseconds
          },
        });
      } else {
        throw Error("Empty quote text");
      }
    }

    const finalFireDate = new Date(
      startTime.getTime() + (totalIntervals + 1) * INTERVAL
    );

    // Add the final notification to the array
    notificationRequests.push({
      content: {
        title: "ToBeWise",
        body: "Open ToBeWise to queue more notifications",
      },
      trigger: {
        date: finalFireDate.getTime(), // converting Date object to milliseconds
      },
    });

    // Iterate over the array and schedule each notification
    for (const request of notificationRequests) {
      try {
        await Notifications.scheduleNotificationAsync(request);
        await sleep(1000);
      } catch (e) {
        console.error("Error scheduling notification:", e);
      }
    }
  }
}
