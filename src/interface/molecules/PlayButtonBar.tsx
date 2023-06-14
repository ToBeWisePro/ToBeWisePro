import React, {useEffect, useState} from 'react'
import {StyleSheet, TouchableOpacity, View} from "react-native";
import { IconFactory } from '../atoms/IconFactory';
import { LIGHT, PRIMARY_BLUE } from '../../../styles/Colors';
import { strings } from '../../res/constants/Strings';
import { globalStyles } from '../../../styles/GlobalStyles';
import {AppText} from "../atoms/AppText";

interface Props {
    setPlayPressed: (x: boolean) => void
    playPressed: boolean
}

enum ScrollControllerButtons {
    Play, Pause
}

export const PlayButtonBar: React.FC<Props> = ({setPlayPressed, playPressed}: Props) => {
    const [buttonToDisplay, setButtonToDisplay] = useState<ScrollControllerButtons>(ScrollControllerButtons.Play)

    useEffect(()=>{
        if(playPressed){
            setButtonToDisplay(ScrollControllerButtons.Pause)
        } else setButtonToDisplay(ScrollControllerButtons.Play)
    }, [playPressed])

    const startScrolling = () => {
        setButtonToDisplay(ScrollControllerButtons.Pause);
        setPlayPressed(true)
    }
    const stopScrolling = () => {
        setButtonToDisplay(ScrollControllerButtons.Play);
        setPlayPressed(false)
    }
 
    return (
        <View style={styles.container}>
            <AppText style={styles.playPauseText}>{"Faster"}</AppText>
            <View style={styles.playPauseContainer}>
                <TouchableOpacity
                    onPress={buttonToDisplay == ScrollControllerButtons.Pause ? stopScrolling : startScrolling}
                    key={Math.random()}>
                    <IconFactory icon={buttonToDisplay == ScrollControllerButtons.Pause ? strings.playPauseButtons.pause: strings.playPauseButtons.play} selected={true}/>
                </TouchableOpacity>
                <AppText style={styles.playPauseText}>{"Play/Pause"}</AppText>
            </View>

            <AppText style={styles.playPauseText}>{"Slower"}</AppText>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: globalStyles.scrollButtonBar.height,
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
        backgroundColor: PRIMARY_BLUE,
        width: "100%",
    },
    playPauseText: {
        color: LIGHT,
        marginBottom: 5
    },
    playPauseContainer: {
        flexDirection: "column",
        justifyContent: "space-around",

    }
})