import { StatusBar } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Discover } from "../../interface/Views/Discover";
import { strings } from "../constants/Strings";
import { HomeHorizontal } from "../../interface/Views/HomeHorizontal";
import { EditQuotes } from "../../interface/Views/EditQuote";
import { HomeVertical } from "../../interface/Views/HomeVertical";
import { Settings } from "../../interface/Views/Settings";
import { NotificationScreen } from "../../interface/Views/NotificationsScreen";
import { NotificationSelectorScreen } from "../../interface/Views/NotificationSelectorScreen";
import React, { useEffect } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../constants/Enums";

interface RootProps {
  initialRoute: string;
}

export const navigationRef = React.createRef();

const Stack = createStackNavigator();

export const RootNavigation: React.FC<RootProps> = ({
  initialRoute,
}: RootProps) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    Notifications.addNotificationResponseReceivedListener(async (response) => {
      const quote = response.notification.request.content.data.quote;
      if (quote === undefined) {
        console.error("Data from notification is not defined");
        return;
      }
      try {
        await AsyncStorage.multiSet([
          [ASYNC_KEYS.notifQuote, JSON.stringify(quote)],
          [ASYNC_KEYS.notifTitle, strings.copy.notificationFrom],
        ]);
        console.debug("Prepared quote for navigation.");
        navigationRef.current?.reset({
          index: 0,
          routes: [
            {
              name: strings.screenName.homeHorizontal,
              params: {
                quoteSearch: {
                  query: quote.subjects,
                  filter: "",
                },
                currentQuotes: [quote],
                showBackButton: false,
              },
            },
          ],
        });
        console.debug("Navigation dispatched.");
      } catch (error) {
        console.error("Error saving quote:", error);
      }
    });
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle={"dark-content"} />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ animationEnabled: false, headerShown: false }}
      >
        <Stack.Screen name={strings.screenName.discover} component={Discover} />
        {/* @ts-expect-error typeerror */}
        <Stack.Screen name={strings.screenName.home} component={HomeVertical} />
        <Stack.Screen
          name={strings.screenName.editQuote}
          component={EditQuotes}
        />
        <Stack.Screen
          name={strings.screenName.homeHorizontal}
          component={HomeHorizontal}
        />
        <Stack.Screen
          name={strings.screenName.notificationSelectorScreen}
          component={NotificationSelectorScreen}
        />
        <Stack.Screen name={strings.screenName.settings} component={Settings} />
        <Stack.Screen
          name={strings.screenName.notificationsScreen}
          component={NotificationScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
