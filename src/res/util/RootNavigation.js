import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Discover } from "../../interface/Views/Discover";
import { HomeHorizontal } from "../../interface/Views/HomeHorizontal";
import { EditQuotes } from "../../interface/Views/EditQuote";
import { HomeVertical } from "../../interface/Views/HomeVertical";
import { Settings } from "../../interface/Views/Settings";
import { NotificationScreen } from "../../interface/Views/NotificationsScreen";
import { NotificationSelectorScreen } from "../../interface/Views/NotificationSelectorScreen";
import { strings } from "../constants/Strings";
import { ASYNC_KEYS } from "../constants/Enums";
import analytics from "@react-native-firebase/analytics";
import { FirstLogin } from "../../interface/Views/FirstLogin";
import { logFirebaseEvent } from "../../backend/FirebaseConfig";

export const navigationRef = React.createRef();

const Stack = createStackNavigator();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getActiveRouteName = (navigationState) => {
  if (navigationState !== null) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes === true) {
    return getActiveRouteName(route.state);
  }
  return route.name;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, react/prop-types
export const RootNavigation = ({ initialRoute }) => {
  useEffect(() => {
    Notifications.addNotificationResponseReceivedListener((response) => {
      void (async () => {
        const quote = response.notification.request.content.data.quote;
        if (quote === null) {
          console.error("Data from notification is not defined");
          return;
        }
        try {
          await AsyncStorage.multiSet([
            [ASYNC_KEYS.notifQuote, JSON.stringify(quote)],
            [ASYNC_KEYS.notifTitle, strings.copy.notificationFrom],
          ]);
          logFirebaseEvent("notification_opened");
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
        } catch (error) {
          console.error("Error saving quote:", error);
        }
      })();
    });
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        const currentRouteName = getActiveRouteName(state);
        if (currentRouteName !== null) {
          void analytics().logScreenView({
            screen_name: currentRouteName,
            screen_class: currentRouteName,
          });
        }
      }}
    >
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ animationEnabled: false, headerShown: false }}
      >
        <Stack.Screen
          name={strings.screenName.firstLogin}
          component={FirstLogin}
        />

        <Stack.Screen name={strings.screenName.discover} component={Discover} />
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
