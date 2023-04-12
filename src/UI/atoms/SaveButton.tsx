import React, {useEffect, useState} from "react";
import {Alert, StyleSheet, TouchableWithoutFeedback, View} from "react-native";
import { strings } from "../../res/constants/Strings";
import { NavigationInterface, RouteInterface } from "../../res/constants/Interfaces";
import {GRAY_2, LIGHT, PRIMARY_GREEN} from "../../../styles/Colors";
import {AppText} from "./AppText";

interface Props {
    pressFunction: () => void
    active: boolean
    navigation: NavigationInterface
    route: RouteInterface
    newQuote: boolean
}

export const SaveButton: React.FC<Props> = ({active, pressFunction, navigation, route, newQuote}: Props) => {
    const [isNewQuote, setIsNewQuote] = useState(newQuote)
    useEffect(()=>setIsNewQuote(newQuote),[])
    const onPressFunction = async () => {
        if (active) {
            navigation.goBack()
        }
    }

    const getTitle = ()=>{
        if(isNewQuote){
            return strings.copy.saveButton
        } else return strings.copy.saveButtonBlank
    }
    return (
        <TouchableWithoutFeedback onPress={onPressFunction}>
            <View style={[styles.container, active ? styles.active : styles.inactive]}>
                <AppText style={styles.buttonText}>{getTitle()}</AppText>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 50,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: LIGHT,
        fontWeight: "bold"
    },
    active: {
        backgroundColor: PRIMARY_GREEN,

    },
    inactive: {
        backgroundColor: GRAY_2,
    }
});
