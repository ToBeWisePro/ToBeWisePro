// NotificationScheduler.tsx
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

const INTERVAL = 1 * 1000; // 1 minute in milliseconds

export const NotificationScheduler: React.FC = () => {
  useEffect(() => {
    const presentNotifications = async () => {
      for (let i = 1; i <= 64; i++) {
        setTimeout(async () => {
          await Notifications.presentNotificationAsync({
            title: `Notification ${i}`,
            body: 'This is a presented notification.',
          });
        }, i * INTERVAL);
      }
    };

    presentNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      () => {
        presentNotifications();
      }
    );

    return () => {
      subscription.remove();
      // Cancel any remaining setTimeout calls when the component is unmounted
      for (let i = 1; i <= 64; i++) {
        clearTimeout(i);
      }
    };
  }, []);

  return null;
};
