import React, { useState, useEffect } from "react";
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { strings } from "../../res/constants/Strings";
import {
  NavigationInterface,
  QuotationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { GRAY_5, GRAY_6, LIGHT, PRIMARY_GREEN } from "../../../styles/Colors";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { TopNav } from "../molecules/TopNav";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { AppText } from "../atoms/AppText";
import { CustomTimeInput } from "../atoms/CustomTimeInput";
import { DataButton } from "../atoms/DataButton";
import { TextInputField } from "../atoms/TextInputField";
import * as Notifications from "expo-notifications";
import { getShuffledQuotes } from "../../res/functions/DBFunctions";
import { NotificationScheduler } from "../../res/util/NotificationScheduler";

interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

const SETTINGS_KEYS = {
  allowNotifications: "allowNotifications",
  startTime: "startTime",
  endTime: "endTime",
  spacing: "spacing",
  query: "query",
  filter: "filter",
};

const saveSettings = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

const loadSettings = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
  return null;
};

export const NotificationScreen: React.FC<Props> = ({
  navigation,
  route,
}: Props) => {
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [spacing, setSpacing] = useState(30);
  const [query, setQuery] = useState(strings.database.defaultQuery);
  const [filter, setFilter] = useState(strings.database.defaultFilter);
  const [reinitializeCounter, setReinitializeCounter] = useState(0);
  const [reinitialize, setReinitialize] = useState(0);


  const reinitializeNotificationScheduler = () => {
    setReinitializeCounter((prevCounter) => prevCounter + 1);
  };

  useEffect(() => {
    const loadSavedSettings = async () => {
      const savedAllowNotifications = await loadSettings(
        SETTINGS_KEYS.allowNotifications
      );
      const savedStartTime = await loadSettings(SETTINGS_KEYS.startTime);
      const savedEndTime = await loadSettings(SETTINGS_KEYS.endTime);
      const savedSpacing = await loadSettings(SETTINGS_KEYS.spacing);
      const savedQuery = await loadSettings(SETTINGS_KEYS.query);
      const savedFilter = await loadSettings(SETTINGS_KEYS.filter);

      if (savedQuery !== null) {
        setQuery(savedQuery);
      }
      if (savedFilter !== null) {
        setFilter(savedFilter);
      }
      if (savedAllowNotifications !== null) {
        setAllowNotifications(savedAllowNotifications);
      }
      if (savedStartTime !== null) {
        setStartTime(new Date(savedStartTime));
      }
      if (savedEndTime !== null) {
        setEndTime(new Date(savedEndTime));
      }
      if (savedSpacing !== null) {
        setSpacing(savedSpacing);
      }
    };
    saveSettings(SETTINGS_KEYS.query, query);
  saveSettings(SETTINGS_KEYS.filter, filter);
    loadSavedSettings();
  }, []);

  const toggleSwitch = () => {
    const updatedAllowNotifications = !allowNotifications;
    setAllowNotifications(updatedAllowNotifications);
    saveSettings(SETTINGS_KEYS.allowNotifications, updatedAllowNotifications);
    reinitializeNotificationScheduler();
  };

  const isValidTimeRange = (start: Date, end: Date) => {
    if (start.getHours() < end.getHours()) {
      return true;
    } else if (start.getHours() === end.getHours()) {
      return start.getMinutes() <= end.getMinutes();
    }
    return false;
  };

  const handleStartTimeChange = (time: Date) => {
    if (isValidTimeRange(time, endTime)) {
      setStartTime(time);
      saveSettings(SETTINGS_KEYS.startTime, time);
      reinitializeNotificationScheduler();
    } else {
      alert(
        'Start Time "${time.toLocaleTimeString()}" must be less than or equal to End Time "${endTime.toLocaleTimeString()}".'
      );
    }
  };

  const handleEndTimeChange = (time: Date) => {
    if (isValidTimeRange(startTime, time)) {
      setEndTime(time);
      saveSettings(SETTINGS_KEYS.endTime, time);
      reinitializeNotificationScheduler();
    } else {
      alert(
        'End Time "${time.toLocaleTimeString()}" must be greater than or equal to Start Time "${startTime.toLocaleTimeString()}".'
      );
    }
  };

  const handleSpacingChange = (value: number) => {
    setSpacing(value);
    saveSettings(SETTINGS_KEYS.spacing, value);
    reinitializeNotificationScheduler();
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    saveSettings(SETTINGS_KEYS.query, text);
    reinitializeNotificationScheduler();
  };

  const handleFilterChange = (filter: string) => {
    setFilter(filter);
    saveSettings(SETTINGS_KEYS.filter, filter);
    reinitializeNotificationScheduler();
  };
  const handleButtonPress = async () => {
    console.log('Test notification button pressed.');
  
    // Log current settings
    const startTimeValue = await AsyncStorage.getItem("startTime");
    const endTimeValue = await AsyncStorage.getItem("endTime");
    const spacingValue = await AsyncStorage.getItem("spacing");
    const queryValue = await AsyncStorage.getItem("query");
    const filterValue = await AsyncStorage.getItem("filter");
  
    console.log('Start Time:', startTimeValue ? new Date(JSON.parse(startTimeValue)).toLocaleString() : 'Not set');
    console.log('End Time:', endTimeValue ? new Date(JSON.parse(endTimeValue)).toLocaleString() : 'Not set');
    
    console.log('Spacing:', spacingValue ? JSON.parse(spacingValue) : 'Not set');
    console.log('Query:', queryValue ? JSON.parse(queryValue) : 'Not set');
    console.log('Filter:', filterValue ? JSON.parse(filterValue) : 'Not set');
    console.log('Allow Notifications:', allowNotifications);
    console.log('Now:', new Date().toString());

  
    // Trigger the notification scheduling process
    reinitializeNotificationScheduler();
  };
  
  return (
    <View style={styles.container}>
      <NotificationScheduler reinitialize={reinitializeCounter} />

      <TopNav
        backButton={true}
        backFunction={() => navigation.goBack()}
        title={strings.screenName.notificationsScreen}
        stickyHeader={true}
      />
      <ScrollView>
        <View style={styles.main}>
          <View style={styles.menuOptionContainerBottom}>
            <AppText>Allow Notifications: </AppText>
            <Switch
              onValueChange={toggleSwitch}
              value={allowNotifications}
              trackColor={{ false: GRAY_5, true: PRIMARY_GREEN }}
            />
          </View>
          <AppText style={styles.title}>Notification Timing</AppText>
          <View style={styles.menuOptionContainer}>
            <AppText>Start Time: </AppText>
            <CustomTimeInput time={startTime} setTime={handleStartTimeChange} />
          </View>
          <View style={styles.menuOptionContainerBottom}>
            <AppText>End Time: </AppText>
            <CustomTimeInput time={endTime} setTime={handleEndTimeChange} />
          </View>
          <View style={styles.menuOptionContainerBottom}>
            <AppText>Time between notifications: </AppText>
            <View style={{flexDirection: "row"}}>
            <TextInput
              keyboardType="numeric"
              style={styles.frequencyInput}
              value={String(spacing)}
              onChangeText={(text) => handleSpacingChange(Number(text))}
            />
            <AppText>minute(s)</AppText>
            </View>
            
          </View>
          <AppText style={styles.title}>Notification Database</AppText>
          <View style={styles.menuOptionContainerBottom}>
            <AppText>Select Filter:</AppText>
            <View style={styles.dataSelector}>
              <DataButton
                buttonText={"Author"}
                selected={filter == strings.filters.author}
                onPress={() => {
                  handleFilterChange(strings.filters.author);
                }}
              />
              <DataButton
                buttonText={"Subject"}
                selected={filter == strings.filters.subject}
                onPress={() => {
                  handleFilterChange(strings.filters.subject);
                }}
              />
            </View>
          </View>
          <View style={styles.menuOptionContainerBottom}>
            <AppText>Author or Subject: </AppText>
            <TextInputField
              placeholderText="query"
              state={query}
              setState={handleQueryChange}
            />
          </View>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
              <AppText style={styles.buttonText}>
                Queue Notifications
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNav
        navigation={navigation}
        screen={strings.screenName.settings}
        whatToInclude={IncludeInBottomNav.Nothing}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    height: "100%",
    width: "100%",
  },
  title: {
    alignSelf: "center",
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "bold",
  },
  dataSelector: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
    width: 224,
    marginBottom: 17,
  },
  main: {
    backgroundColor: GRAY_6,
    height: Dimensions.get("window").height,
    width: "100%",
  },
  menuOptionContainer: {
    height: 60,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  menuOptionContainerBottom: {
    borderBottomColor: GRAY_5,
    borderBottomWidth: 0.5,
    marginBottom: 25,
    height: 60,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  button: {
    borderRadius: 10,
    backgroundColor: PRIMARY_GREEN,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 180,
  },
  buttonText: {
    color: LIGHT,
    fontWeight: "bold",
  },
  frequencyInput: {
    width: 40,
    marginHorizontal: 10,
    backgroundColor: GRAY_6,
    textAlign: "center",

  },
});
