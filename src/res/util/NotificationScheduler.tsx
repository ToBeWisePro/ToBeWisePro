import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../functions/DBFunctions";
import { strings } from "../constants/Strings";
import { Alert } from "react-native";
import { ASYNC_KEYS } from "../constants/Enums";

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
    const value = await AsyncStorage.getItem(ASYNC_KEYS.allowNotifications);
    if (value !== null) {
      allowNotifications = JSON.parse(value);
    }
  } catch (error) {
    console.error("Error loading allowNotifications setting:", error);
  }

  const queryValue = await AsyncStorage.getItem(ASYNC_KEYS.notificationQuery);
  const filterValue = await AsyncStorage.getItem(ASYNC_KEYS.notificationFilter);
  const spacingValue = await AsyncStorage.getItem(ASYNC_KEYS.spacing);

  // const query = queryValue
  //   ? JSON.parse(queryValue)
  //   : strings.database.defaultQuery;
  let query: string;
  try {
    query = queryValue ? JSON.parse(queryValue) : strings.database.defaultQuery;
  } catch (error) {
    console.log("Error parsing queryValue:", error);
    query = strings.database.defaultQuery;
  }

  const filter = filterValue
    ? JSON.parse(filterValue)
    : strings.database.defaultFilter;
  const spacing = spacingValue ? JSON.parse(spacingValue) : 30;

  const ONE_DAY = 24 * 60 * 60 * 1000; // One day in milliseconds
  const ONE_MINUTE = 60 * 1000; // One minute in milliseconds
  const MAX_INTERVALS = 60; // Max number of notifications that can be scheduled at once
  const spacingInMilliseconds = spacing * ONE_MINUTE;

  const startTime = new Date(Date.now() + 2500); // Fire the first notification 2.5s after queuing it
  let finalNotificationMessage = ""
  const durationAfterOneInterval = ONE_DAY - spacingInMilliseconds;

  let totalIntervals = Math.floor(
    durationAfterOneInterval / spacingInMilliseconds
  );

  if (totalIntervals > MAX_INTERVALS) {
    totalIntervals = MAX_INTERVALS;
  }

  if (allowNotifications && spacing > 0) {
    const queue = await getShuffledQuotes(true)
      .then(async (quotes) => {
        
        const notificationRequests = [];
        const fireTimes = []; // Array to store the fire times
        let prevFireTime = 0;
        let numTimes = 0;
        // set numTimes to be the lesser of totalIntervals and quotes.length
        if (totalIntervals < quotes.length) {
          numTimes = totalIntervals;
        } else {
          numTimes = quotes.length;
        }
        for (let i = 0; i < numTimes; i++) {
          const fireDate = new Date(
            startTime.getTime() + i * spacingInMilliseconds
          );
          const quote = quotes[i];
          if (quote.quoteText.length > 0) {
            if (fireDate.getTime() <= prevFireTime + 5000) {
              console.log(
                "Two quotes found that are scheduled too close together. Skipping one."
              );
              continue;
            }
            prevFireTime = fireDate.getTime();
            fireTimes.push(prevFireTime); // Add the fire time to the array
            notificationRequests.push({
              content: {
                title: "ToBeWise",
                body: quote.quoteText + "\n-" + quote.author,
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

        const finalFireDate = new Date(
          startTime.getTime() + (totalIntervals + 1) * spacingInMilliseconds
        );

        // build the final notification by setting the finalNotificationMessage to follow this format: The chosen set of NN quotations for author/subject XXXXXXX has been fully played out. For more please go to Settings – Notifications and choose a different author/subject

        if (query === "author") {
          finalNotificationMessage = 
            "The chosen set of " +
            quotes.length +
            " quotations for author " +
            query +
            " has been fully played out. For more please go to Settings – Notifications and choose a different author.";
        } else if (query === "subject") {
          finalNotificationMessage =
            "The chosen set of " +
            quotes.length +
            " quotations for subject " +
            query +
            " has been fully played out. For more please go to Settings – Notifications and choose a different subject.";
        } else {
          finalNotificationMessage =
            "The chosen set of " +
            quotes.length +
            " quotations has been fully played out. For more please go to Settings – Notifications and choose a different author/subject.";
        }
        fireTimes.push(finalFireDate.getTime()); // Add the final fire time to the array
        notificationRequests.push({
          content: {
            title: "ToBeWise",
            body: finalNotificationMessage
          },
          trigger: {
            date: finalFireDate.getTime(),
          },
        });

        // Send a notification immidiately which is randomly selected from the quotes array to show that the update worked
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        Notifications.scheduleNotificationAsync({
          content: {
            title: "ToBeWise",
            body: randomQuote.quoteText + "\n\n-" + randomQuote.author,
            data: {
              quote: randomQuote,
            },
          },
          trigger: {
            date: new Date(Date.now() + 5000).getTime(),
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
          const difference = (fireTimes[i] - fireTimes[i - 1]) / 1000; // Difference in seconds
          // console.log(`Difference in seconds between notification ${i} and ${i+1}: ${difference}`);
        }
      })
      .catch((error) => {
        console.log("tossing an error")
        throw error;
      });
  }
}
