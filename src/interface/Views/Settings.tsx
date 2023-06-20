import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Share,
} from "react-native";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { strings } from "../../res/constants/Strings";
import { TopNav } from "../molecules/TopNav";
import { GRAY_6 } from "../../../styles/Colors";
import { openLink } from "../../res/functions/UtilFunctions";
import { SettingsButton } from "../molecules/SettingsButton";

interface Props {
  navigation: {
    navigate: (ev: string) => void;
    goBack: () => void;
    push: (ev: string, {}) => void;
  };
}

interface Button {
  icon: string;
  title: string;
  onPress: () => void;
}
export const Settings = ({ navigation }: Props) => {
  const buttons: Button[] = [
    {
      icon: "notifications",
      title: strings.settings.notifications,
      onPress: () =>
        navigation.navigate(strings.screenName.notificationsScreen),
    },
    {
      icon: "info",
      title: strings.settings.info,
      onPress: () => openLink("https://tobewise.co/"),
    },
    {
      icon: "star",
      title: strings.settings.rateUs,
      onPress: () =>
        openLink("https://apps.apple.com/ca/app/tobewise-pro/id1156018700"),
    },
    {
      icon: "share",
      title: strings.settings.share,
      onPress: async () => {
        try {
          const result = await Share.share({
            message: strings.settings.shareMessage,
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          // @ts-ignore
          alert(error.message);
        }
      },
    },
    {
      icon: "help",
      title: strings.settings.support,
      onPress: () => openLink(strings.settings.urls.support),
    },
    {
      icon: "web",
      title: strings.settings.terms,
      onPress: () => openLink(strings.settings.urls.terms),
    },
    {
      icon: "people",
      title: strings.settings.ourTeam,
      onPress: () => openLink(strings.settings.urls.team),
    },
    {
      icon: '',
      title: strings.settings.versionNumberText,
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <TopNav
        stickyHeader={true}
        title={strings.screenName.settings}
        backButton={false}
      />
      <FlatList
        style={styles.buttonList}
        data={buttons}
        renderItem={(button) => {
          return (
            <SettingsButton
              icon={button.item.icon}
              title={button.item.title}
              onPress={button.item.onPress}
            />
          );
        }}
      />

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
    height: Dimensions.get("window").height,
    backgroundColor: "#000",
  },
  buttonList: {
    backgroundColor: GRAY_6,
    height: "100%",
  },
});
