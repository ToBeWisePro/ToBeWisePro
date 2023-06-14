import React from 'react';
import {View, StyleSheet} from "react-native";
import {DARK, GRAY_3, GRAY_4, GRAY_5, GRAY_6, LIGHT} from "../../../styles/Colors";
import {AppText} from "./AppText";

interface Props {
    label: string
}

export const DiscoverSectionHeader = ({label}: Props) => {
    return (
        <View style={styles.container}>
            <AppText style={styles.text}>{label}</AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 30,
        width: '100%',
        backgroundColor: GRAY_5,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: GRAY_3,
        borderBottomColor: GRAY_3,
        justifyContent: 'center'
    },
    text: {
        marginLeft: 10,
        color: DARK
    }
})