import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getQuotes, getShuffledQuotes } from "../functions/DBFunctions";
import { strings } from "../constants/Strings";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scheduleNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error cancelling old notifications:", error);
  }
  // console.log("Scheduling notifications")
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

  const ONE_DAY = 24 * 60 * 60 * 1000; // One day in milliseconds
  const ONE_MINUTE = 60 * 1000; // One minute in milliseconds
  const MAX_INTERVALS = 60 // Max number of notifications that can be scheduled at once
  const spacingInMilliseconds = spacing * ONE_MINUTE;

  const startTime = new Date(Date.now() + spacingInMilliseconds);

  const durationAfterOneInterval = ONE_DAY - spacingInMilliseconds;

  let totalIntervals = Math.floor(durationAfterOneInterval / spacingInMilliseconds);

  if (totalIntervals > MAX_INTERVALS) {
    totalIntervals = MAX_INTERVALS;
  }

  if (allowNotifications && spacing > 0) {
    const queue = await getShuffledQuotes(query, filter).then(async (quotes)=>{
      // console.log("Got quotes: " + quotes.length)
      const notificationRequests = [];
      const fireTimes = []; // Array to store the fire times
      let prevFireTime = 0;
  
      for (let i = 0; i <= totalIntervals; i++) {
        const fireDate = new Date(startTime.getTime() + (i * spacingInMilliseconds));
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        if (quote.quoteText.length > 0) {
          if (fireDate.getTime() <= prevFireTime + 5000) {
            console.log('Two quotes found that are scheduled too close together. Skipping one.');
            continue;
          }
          prevFireTime = fireDate.getTime();
          fireTimes.push(prevFireTime); // Add the fire time to the array
          notificationRequests.push({
            content: {
              title: "ToBeWise",
              body: quote.quoteText + "\n\n-" + quote.author,
              data: {
                quote: quote,
              },
            },
            trigger: {
              date: fireDate.getTime(),
            },
          });
        } else {
          throw Error("Empty quote text");
        }
      }
  
      const finalFireDate = new Date(startTime.getTime() + (totalIntervals + 1) * spacingInMilliseconds);
      fireTimes.push(finalFireDate.getTime()); // Add the final fire time to the array
      notificationRequests.push({
        content: {
          title: "ToBeWise",
          body: "Open ToBeWise to queue more notifications",
        },
        trigger: {
          date: finalFireDate.getTime(),
        },
      });
  
      for (const request of notificationRequests) {
        try {
          await Notifications.scheduleNotificationAsync(request);
          // await sleep(1000);
        } catch (e) {
          console.error("Error scheduling notification:", e);
        }
      }
  
      // Calculate and log the difference in fire times
      for (let i = 1; i < fireTimes.length; i++) {
        const difference = (fireTimes[i] - fireTimes[i-1]) / 1000; // Difference in seconds
        // console.log(`Difference in seconds between notification ${i} and ${i+1}: ${difference}`);
      }
    }).catch((error)=>{
      throw error;
    });

   
  }
}
