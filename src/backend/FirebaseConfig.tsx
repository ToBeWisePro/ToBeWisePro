// Import the functions you need from the SDKs you need

import { getAnalytics, logEvent } from "@react-native-firebase/analytics";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAxul3mJRh-CZoBwEfBs6Qqqb--_JLJMRo",
  authDomain: "tobewise-187b9.firebaseapp.com",
  projectId: "tobewise-187b9",
  storageBucket: "tobewise-187b9.appspot.com",
  messagingSenderId: "185980455678",
  appId: "1:185980455678:web:66855b574fe056efa9b3af",
  measurementId: "G-T3Y9SLZ7PH",
};

const app = initializeApp(firebaseConfig);

export const logFirebaseEvent = (
  event: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: {},
): void => {
  // @ts-expect-error   Type 'FirebaseApp' is missing the following properties from type 'FirebaseApp': delete, utils, analyticsts(2345)
  const analytics = getAnalytics(app);
  void logEvent(analytics, event, data);
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
