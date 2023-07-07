// This component is used on the Discover screen to display a clickable subject bubble
import React from 'react'
import {StyleSheet, TouchableOpacity} from 'react-native'
import { LIGHT, PRIMARY_BLUE } from '../../../styles/Colors'
import { AppText } from '../atoms/AppText'
import { NavigationInterface } from '../../res/constants/Interfaces';
import { getShuffledQuotes } from '../../res/functions/DBFunctions';
import { strings } from '../../res/constants/Strings';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props{
    subject: string
    navigation: NavigationInterface
}

export const SubjectBubble: React.FC<Props> = ({subject, navigation}:Props) => {
    return(
        <TouchableOpacity style={styles.container} onPress={async ()=>{
            await AsyncStorage.setItem("query", subject)
            await AsyncStorage.setItem("filter", strings.filters.subject)

            await getShuffledQuotes(subject, strings.filters.subject).then((res)=>navigation.push(strings.screenName.home, {currentQuotes: res, quoteSearch: {filter: strings.filters.subject, query: subject}}))
            
        }}>
            <AppText style={styles.textStyle}>{subject}</AppText>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        borderRadius: 7,
        backgroundColor: PRIMARY_BLUE,
        paddingLeft: 10, 
        paddingRight: 10,
        height: 30,
        alignContent: 'center',
        justifyContent: 'center',
        marginHorizontal: 5
    },
    textStyle:{
        color: LIGHT
    }
})