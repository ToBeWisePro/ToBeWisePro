// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
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
import React from "react";

interface RootProps {
  initialRoute: string;
}

export const navigationRef = React.createRef();

const Stack = createStackNavigator();

export const RootNavigation: React.FC<RootProps> = ({
  initialRoute,
}: RootProps) => {
  return (
    <NavigationContainer>
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
