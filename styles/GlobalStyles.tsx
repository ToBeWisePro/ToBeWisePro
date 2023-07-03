import {Dimensions, StyleSheet} from "react-native";

export const globalStyles = StyleSheet.create({
  quoteText: {
    fontSize: 20,
    flex: 1,
  },
  authorText: {
    fontWeight: "bold",
    fontSize: 17,
    // paddingBottom: 3
  },
  smallQuoteContainer:{
    height: 245,
    marginBottom: 22,
    paddingTop: 20
  },
  largeQuoteContainer:{
    width: 375,
    height: 580,
    marginLeft: 12
  },
  navbar: {
    height: 70,
    playPauseHeight: 40,
    topHeight: 55,
  },
  scrollButtonBar: {
    height: 50
  }
});

