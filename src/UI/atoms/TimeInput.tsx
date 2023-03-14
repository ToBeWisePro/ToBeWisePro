import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import  DateTimePicker, {DateTimePickerEvent}  from '@react-native-community/datetimepicker';
import { LIGHT } from '../../../styles/Colors';

interface Props {
    time: Date,
    setTime: (x: Date) => void
}

export const CustomTimeInput: React.FC<Props> = ({time, setTime}: Props)=> {
    const setDate = (date: Date) => {
        setTime(date)
    }
    
    return(
        <TouchableOpacity style={styles.container}>
            <DateTimePicker 
            mode={"time"}
            value={time}
            //@ts-ignore
            onChange={setDate}
            />
        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({
    container: {
        height: "80%",
        width: 100,
        backgroundColor: LIGHT,
        
    }
})