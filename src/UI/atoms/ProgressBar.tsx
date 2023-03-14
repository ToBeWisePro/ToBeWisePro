import React, { FunctionComponent, useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Dimensions } from "react-native";
import { LIGHT, PRIMARY_GREEN } from "../../../styles/Colors";

interface Props {
  timing: number;
  index: number; // what quote are we on? Use this to re-fire animation bar
  executeAnimation: boolean;
}

export const ProgressBar: React.FC<Props> = ({
  timing,
  executeAnimation,
  index,
}: Props) => {
  const animatedRef = React.useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get("screen");
  const finalWidth = width;

  useEffect(() => {
    if (executeAnimation) {
      Animated.timing(animatedRef, {
        toValue: finalWidth,
        duration: timing,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if(finished){
            Animated.spring(animatedRef, {
                toValue: 0,
                useNativeDriver: false,
              }).start();
        } else {
            console.log("not finished")
        }
        
      });
    }
  }, [index]);

  return (
    <View style={styles.barContainer}>
      <Animated.View
        style={[styles.progressBar, { width: animatedRef }]}
        //@ts-ignore
        ref={animatedRef}
      ></Animated.View>
      {/* <AppText>Buidling</AppText> */}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: LIGHT,
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    width: "100%",
  },
  progressBar: {
    backgroundColor: PRIMARY_GREEN,
    width: 100,
    height: "100%",
  },
});
