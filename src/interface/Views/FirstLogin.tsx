import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import YouTube from "react-native-youtube";
import {
  GRADIENT_END,
  GRADIENT_START,
  GRAY_6,
  PRIMARY_GREEN,
} from "../../../styles/Colors";
import { type NavigationInterface } from "../../res/constants/Interfaces";
import { TopNav } from "../molecules/TopNav";
import { strings } from "../../res/constants/Strings";
import { TEST_IDS } from "../../res/constants/TestIDs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../../res/constants/Enums";
import LinearGradient from "react-native-linear-gradient";
import Config from "react-native-config"; // Import Config
import { AppText } from "../atoms/AppText";

interface Props {
  navigation: NavigationInterface;
}

export const FirstLogin = ({ navigation }: Props): JSX.Element => {
  const apiKey = Config.YOUTUBE_API_KEY;

  if (apiKey == null) {
    console.error("YouTube API key is not defined!");
    return (
      <View>
        <Text>Error: YouTube API key is missing.</Text>
        <TouchableOpacity
          onPress={() => {
            void AsyncStorage.setItem(
              ASYNC_KEYS.firstTimeLogin,
              JSON.stringify(false),
            );
            navigation.navigate(strings.screenName.home);
          }}
          style={{ backgroundColor: "#f0f", height: 500, width: 500 }}
        >
          <AppText>Go to app</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNav
        title={strings.copy.firstLoginHeader}
        stickyHeader={true}
        testID={TEST_IDS.topNav}
        backButton={false}
      />
      <LinearGradient
        colors={[GRADIENT_START, GRADIENT_END]}
        style={styles.background}
      >
        <YouTube
          videoId="5JaDeG_bNMg" // The YouTube video ID
          apiKey={apiKey} // Use the API key from .env file
          play // control playback of video with true/false
          fullscreen // control whether the video should play in fullscreen or inline
          loop // control whether the video should loop when ended
          style={styles.youtube}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            void AsyncStorage.setItem(
              ASYNC_KEYS.firstTimeLogin,
              JSON.stringify(false),
            );
            navigation.navigate(strings.screenName.home);
          }}
        >
          <Text style={styles.buttonText}>Get Started!</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  youtube: {
    alignSelf: "center",
    height: Dimensions.get("window").height * 0.7,
    width: "90%",
    marginTop: 20,
  },
  background: {
    width: "100%",
    alignItems: "center",
    height: "100%",
  },
  button: {
    backgroundColor: PRIMARY_GREEN,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  buttonList: {
    backgroundColor: GRAY_6,
    height: "100%",
  },
});
