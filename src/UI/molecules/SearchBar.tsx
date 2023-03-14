import React, {useState} from 'react'
import {StyleSheet, View} from "react-native";
import {LIGHT, PRIMARY_RED} from "../../../styles/Colors";
import {IconFactory} from "../atoms/IconFactory";
import {TextInputField, TextInputSize} from "../atoms/TextInputField";
import {strings} from "../../res/constants/Strings";

interface Props {
    state: string,
    setState: (x: string)=> void
}

export const SearchBar: React.FC<Props> = ({state, setState}: Props) =>{
    return(
        <View style={styles.container}>
            <IconFactory icon={'search'} selected={false} />
            <View style={{width: 300}}>
                {/* <TextInputField placeholderText={strings.copy.searchBarPlaceholderText} size={TextInputSize.Small} state={state} setState={()=>setState} /> */}
                <TextInputField 
                size={TextInputSize.Small}
                setState={(e: string) => setState(e)}
                placeholderText={strings.copy.searchBarPlaceholderText}
                state={state}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 51,
        width: 365,
        backgroundColor: LIGHT,
        marginTop: 33,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: 'center',
        paddingHorizontal: 10,
        flexDirection: 'row',
    },
})