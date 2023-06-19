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
import { QuotationInterface } from "../constants/Interfaces";
import { NotificationSelectorScreen } from "../../interface/Views/NotificationSelectorScreen";
import { NotificationDebugScreen } from "../../interface/Views/NotificationDebugScreen";

interface RootProps {
  initialRoute: string;
  shuffledQuotes: QuotationInterface[];
}

const Stack = createStackNavigator();
export const RootNavigation: React.FC<RootProps> = ({
  initialRoute,
  shuffledQuotes,
}: RootProps) => {
  return (
    <NavigationContainer>
      <StatusBar barStyle={"dark-content"} />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          animationEnabled: false,
          //   gestureResponseDistance: { horizontal: 20 },
        }}
      >
        <Stack.Screen
          name={strings.screenName.discover}
          component={Discover}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={strings.screenName.home}
          options={{ headerShown: false }}
        >
          {(props) => (
            <HomeVertical {...props} initialQuotes={shuffledQuotes} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={strings.screenName.editQuote}
          component={EditQuotes}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name={strings.screenName.notificationDebugScreen}
          component={NotificationDebugScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={strings.screenName.homeHorizontal}
          component={HomeHorizontal}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={strings.screenName.notificationSelectorScreen}
          component={NotificationSelectorScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={strings.screenName.settings}
          component={Settings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={strings.screenName.notificationsScreen}
          component={NotificationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
