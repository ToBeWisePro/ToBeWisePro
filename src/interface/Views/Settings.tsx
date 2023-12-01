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
import Rate, { AndroidMarket } from "react-native-rate";

interface Props {
  navigation: NavigationInterface;
}

interface Button {
  icon: string;
  title: string;
  onPress: () => void; // Changed to void as we are wrapping async functions
}

export const Settings = ({ navigation }: Props): JSX.Element => {
  const rateApp = (): void => {
    const options = {
      AppleAppID: "1156018700", // Your Apple App Store ID
      preferredAndroidMarket: AndroidMarket.Google, // Even though you're not using Android, this needs to be here.
      preferInApp: true,
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: "https://www.apple.com/ios/app-store/",
    };

    Rate.rate(options, (success) => {
      if (success) {
        // User successfully went to the App Store (or just opened the in-app review dialog)
      }
    });
  };

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
        rateApp();
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
      icon: "play-circle-filled",
      title: strings.settings.introVideo,
      onPress: () => {
        void (async () => {
          await openLink(strings.settings.urls.howToGuide);
        })();
      },
    },
    {
      icon: "",
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
