import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { NavButton } from "../atoms/NavButton";
import { strings } from "../../res/constants/Strings";
import { globalStyles } from "../../../styles/GlobalStyles";
import {
  type NavButtonInterface,
  type NavigationInterface,
} from "../../res/constants/Interfaces";
import { PlayButtonBar } from "../molecules/PlayButtonBar";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { TEST_IDS } from "../../res/constants/TestIDs";

interface Props {
  navigation: NavigationInterface;
  screen: string;
  whatToInclude: IncludeInBottomNav;
  setPlayPressed?: ((bool: boolean) => void) | undefined;
  playPressed?: boolean | undefined;
  scrollSpeed?: number;
  setScrollSpeed?: (x: number) => void;
  resetScrollPosition?: () => void;
  showLabels?: boolean;
}

export const BottomNav: React.FC<Props> = ({
  navigation,
  screen,
  whatToInclude,
  setPlayPressed,
  playPressed,
  showLabels,
  resetScrollPosition,
}: Props) => {
  const navButtons: NavButtonInterface[] = [
    {
      buttonText: strings.screenName.home,
      selected: screen === strings.screenName.home,
      navigationTarget: strings.screenName.home,
      navigation,
    },
    {
      buttonText: strings.screenName.discover,
      selected: screen === strings.screenName.discover,
      navigationTarget: strings.screenName.discover,
      navigation,
    },
    {
      buttonText: strings.screenName.settings,
      selected: screen === strings.screenName.settings,
      navigationTarget: strings.screenName.settings,
      navigation,
    },
  ];

  return (
    <View style={styles.container} testID={TEST_IDS.bottomNav}>
      {whatToInclude === IncludeInBottomNav.PlayButton && (
        <View style={styles.scrollButtonViewNoSlidebar}>
          <PlayButtonBar
            setPlayPressed={setPlayPressed}
            playPressed={playPressed}
            showLabels={showLabels}
          />
        </View>
      )}
      <View style={styles.navbar} testID="navbar">
        {navButtons.map((button) => (
          <View
            style={{
              width: Dimensions.get("window").width / navButtons.length,
            }}
            key={Math.random()}
          >
            <NavButton
              buttonText={button.buttonText}
              selected={button.selected}
              navigationTarget={button.navigationTarget}
              navigation={button.navigation}
              key={Math.random()}
              resetScrollPosition={resetScrollPosition}
            />
          </View>
        ))}
      </View>
      <View style={{ height: 54, backgroundColor: "#000" }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: globalStyles.navbar.height + globalStyles.scrollButtonBar.height,
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 20,
    color: LIGHT,
    // textAlign: 'center',
    fontWeight: "400",
    flex: 1,
    marginLeft: 18,
  },
  navbar: {
    height: globalStyles.navbar.height,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: PRIMARY_BLUE,
  },
  scrollButtonView: {
    height: globalStyles.scrollButtonBar.height + 50,
    width: "100%",
    backgroundColor: PRIMARY_BLUE,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  scrollButtonViewNoSlidebar: {
    height: globalStyles.scrollButtonBar.height,
    width: "100%",
    backgroundColor: PRIMARY_BLUE,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  scrollBarContainer: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
});
