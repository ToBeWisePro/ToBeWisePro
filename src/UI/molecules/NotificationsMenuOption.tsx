import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { GRAY_4, GRAY_5, LIGHT, PRIMARY_GREEN } from "../../../styles/Colors";
import { AppText } from "../atoms/AppText";
import { Switch } from "react-native";
import { CustomTimeInput } from "../atoms/CustomTimeInput";
import { NotificationFrequencySelector } from "../atoms/NotificationFrequencySelector";
import { NotificationsMenuOptionEnum } from "../../res/constants/Enums";
import { NotificationsMenuOptionProps } from '../../res/constants/Interfaces';




export const NotificationsMenuOption: React.FC<
NotificationsMenuOptionProps
> = ({
  notificationsMenuOptionEnum,
  bottomLine,
  label,
  state,
  setState,
  toggleFunction,
}: NotificationsMenuOptionProps) => {


  return (
    <View style={[styles.menuOptionContainer, bottomLine && styles.bottomLine]}>
      <AppText> {label} </AppText>
      {notificationsMenuOptionEnum ==
        NotificationsMenuOptionEnum.Toggle && (
        <Switch
          onValueChange={toggleFunction}
          value={state}
          trackColor={{ false: GRAY_5, true: PRIMARY_GREEN }}
        />
      )}
      {notificationsMenuOptionEnum ==
        NotificationsMenuOptionEnum.TimeSelector && (
        <CustomTimeInput 
        time={state}
        setTime={setState}
        />
      )}
      {notificationsMenuOptionEnum ==
        NotificationsMenuOptionEnum.FrequencySelector && (
        <NotificationFrequencySelector state={state} setState={setState}/>
      )}
      {notificationsMenuOptionEnum ==
        NotificationsMenuOptionEnum.DBSelector && (
        <NotificationFrequencySelector state={state} setState={setState}/>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  menuOptionContainer: {
    height: 40,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    justifyContent: "space-between",
  },
  bottomLine: {
    borderBottomColor: GRAY_4,
    borderBottomWidth: 0.5,
    marginBottom: 25
  },
});
