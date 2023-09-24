import React from "react";
import { View, StyleSheet, Dimensions, FlatList, Share } from "react-native";
import { BottomNav } from "../organisms/BottomNav";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { strings } from "../../res/constants/Strings";
import { TopNav } from "../molecules/TopNav";
import { GRAY_6 } from "../../../styles/Colors";
import { openLink } from "../../res/functions/UtilFunctions";
import { SettingsButton } from "../molecules/SettingsButton";
import { TEST_IDS } from "../../res/constants/TestIDs";
import { type NavigationInterface } from "../../res/constants/Interfaces";

interface Props {
  navigation: NavigationInterface;
}

interface Button {
  icon: string;
  title: string;
  onPress: () => void; // Changed to void as we are wrapping async functions
}

export const Settings = ({ navigation }: Props): JSX.Element => {
  const buttons: Button[] = [
    {
      icon: "notifications",
      title: strings.settings.notifications,
      onPress: () => {
        navigation.navigate(strings.screenName.notificationsScreen);
      },
    },
    {
      icon: "info",
      title: strings.settings.info,
      onPress: () => {
        void (async () => {
          await openLink("https://tobewise.co/");
        })();
      },
    },
    {
      icon: "star",
      title: strings.settings.rateUs,
      onPress: () => {
        void (async () => {
          await openLink(
            "https://apps.apple.com/ca/app/tobewise-pro/id1156018700",
          );
        })();
      },
    },
    {
      icon: "share",
      title: strings.settings.share,
      onPress: () => {
        void (async () => {
          try {
            const result = await Share.share({
              message: strings.settings.shareMessage,
            });
            if (result.action === Share.sharedAction) {
              // handle shared action
            } else if (result.action === Share.dismissedAction) {
              // handle dismissed action
            }
          } catch (error: any) {
            alert(error.message);
          }
        })();
      },
    },
    {
      icon: "help",
      title: strings.settings.support,
      onPress: () => {
        void (async () => {
          await openLink(strings.settings.urls.support);
        })();
      },
    },
    {
      icon: "web",
      title: strings.settings.terms,
      onPress: () => {
        void (async () => {
          await openLink(strings.settings.urls.terms);
        })();
      },
    },
    {
      icon: "people",
      title: strings.settings.ourTeam,
      onPress: () => {
        void (async () => {
          await openLink(strings.settings.urls.team);
        })();
      },
    },
    {
      icon: "",
      title: strings.settings.versionNumberText,
      onPress: () => {},
    },
  ];

  // ... rest of the component
  return (
    <View style={styles.container}>
      <TopNav
        stickyHeader={true}
        title={strings.screenName.settings}
        backButton={false}
        testID={TEST_IDS.topNav}
      />
      <FlatList
        style={styles.buttonList}
        data={buttons}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={(button) => (
          <SettingsButton
            icon={button.item.icon}
            title={button.item.title}
            onPress={button.item.onPress}
          />
        )}
      />
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.settings}
        whatToInclude={IncludeInBottomNav.Nothing}
        playPressed={false}
        scrollSpeed={0}
        testID={TEST_IDS.bottomNav}
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
