import React, {useState, useEffect} from "react";
import {View, StyleSheet, TextInput, KeyboardAvoidingView} from "react-native";
import {AppText} from "./AppText";
import { LIGHT } from "../../../styles/Colors";

export interface TextInputProps {
    placeholderText: string;
    size: TextInputSize;
    label?: string;
    state: string
    setState: (ev: string) => void;
    id?: number
}

export enum TextInputSize {
    Small,
    Large,
}

export const TextInputField: React.FC<TextInputProps> = ({
                                                    placeholderText, size, label, state, setState
                                                }: TextInputProps) => {
    const getInputContainerStyle = () => {
        if (size == TextInputSize.Large) {
            return styles.largeContainer;
        } else return styles.smallContainer;
    };
    const [initialText, setInitialText] = useState(state);

    useEffect(()=>{
        setInitialText(state)
    },[])

    // useEffect(() => {
    //     if (onChangeText && state != initialText) {
    //         onChangeText()
    //     }
    // }, [state])
    return (
        <View style={styles.container}>
            {label && <AppText style={styles.title}>{label}</AppText>}
            <View style={[styles.inputContainer, getInputContainerStyle()]}>
                {/*TODO make the parent view a KeyboardAvoidingView*/}
                <TextInput
                    onChangeText={(text)=> setState(text)
                    }
                    placeholder={placeholderText}
                    keyboardType={"default"}
                    multiline={size == TextInputSize.Large}
                    defaultValue={state}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    title: {
        fontWeight: "bold",
        fontSize: 16
    },
    inputContainer: {
        backgroundColor: LIGHT,
        width: "100%",
        borderRadius: 5,
        padding: 10,

    },
    largeContainer: {
        height: 235,
    },
    smallContainer: {
        height: 50,
        flexDirection: "row",
    },
});
