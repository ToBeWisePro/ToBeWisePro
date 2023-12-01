import { getAnalytics, logEvent } from "@react-native-firebase/analytics";
// @ts-expect-error Cannot find module '@react-native-firebase/app' or its corresponding type declarations.
import { getApp } from "@react-native-firebase/app"; // <-- Import this

// Import values from the .env file
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";

// Updated Firebase configuration to use environment variables
export const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

export const logFirebaseEvent = (
  event: string,
  data: Record<string, unknown>,
): void => {
  try {
    const appInstance = getApp(); // <-- Get the default app instance

    const analytics = getAnalytics(appInstance);
    void logEvent(analytics, event, data);
  } catch (error) {
    console.log(error);
  }
};

export const firebaseEventsKeys = {
  pressedNotification: "notification_pressed",
  pressedDelete: "delete_pressed",
  pressedAdd: "add_pressed",
  pressedEdit: "edit_pressed",
  pressedVideo: "pressed_video",
  pressedFavorite: "favorite_pressed",
  pressedShare: "share_pressed",
};
