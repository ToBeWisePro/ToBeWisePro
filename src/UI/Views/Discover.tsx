import React, {useState, useEffect} from "react";
import {
    View,
    StyleSheet,
} from "react-native";
import {TopNav} from "../molecules/TopNav";
import { strings } from "../../res/constants/Strings";
import { maxWindowSize } from "../../res/constants/Values";
import {AlphabetList, IData} from "react-native-section-alphabet-list";
import {GRAY_1, GRAY_6, LIGHT, PRIMARY_BLUE} from "../../../styles/Colors";
import { getAuthors, getSubjects } from "../../res/functions/DBFunctions";
import { BottomNav } from "../organisms/BottomNav";
import { DataButton } from "../atoms/DataButton";
import {DiscoverTile} from "../molecules/DiscoverTile";
import { DiscoverSectionHeader } from "../atoms/DiscoverSectionHeader";
import { globalStyles } from "../../../styles/GlobalStyles";
import { NavigationInterface } from "../../res/constants/Interfaces";
import { SearchBar } from "../molecules/SearchBar";
import { IncludeInBottomNav } from "../../res/constants/Enums";

interface Props {
    navigation: NavigationInterface;
}

export const Discover = ({navigation}: Props) => {
    const [subjects, setSubjects] = useState<IData[]>([]);
    const [authors, setAuthors] = useState<IData[]>([]);
    const [filter, setFilter] = useState<string>("");
    const [search, setSearch] = useState<string>("")
    const [tempSubjects, setTempSubjects] = useState<IData[]>([])
    const [tempAuthors, setTempAuthors] = useState<IData[]>([])
    

    useEffect(() => {
       // set authors and subjects
        const load = async () => {
            await getSubjects().then((res) =>{
                formatDataForAlphabetList(res, setSubjects)
            }
            )
            await getAuthors().then((res) => {
                formatDataForAlphabetList(res, setAuthors)
                formatDataForAlphabetList(res, setTempAuthors)
            })

        };
        setFilter(strings.filters.author)
        
        load()

    }, []);

    const formatDataForAlphabetList = ((data: String[], setFunction: (arg: IData[])=> void)=>{
        // AlphabetList requires {key, value} so we have to take our strings and convert them to key value pairs
        const dataObjects: IData[] = [];
        data.forEach((string) => {
            // @ts-ignore
            dataObjects.push({ key: Math.random().toString(), value: string });
        });
        dataObjects.push({key: "a", value: strings.customDiscoverHeaders.all})
        dataObjects.push({key: "b", value: strings.customDiscoverHeaders.addedByMe})
        // dataObjects.push({key:"e", value: strings.customDiscoverHeaders.deleted})
        dataObjects.push({key: "d", value: strings.customDiscoverHeaders.favorites})
        dataObjects.push({key: "c", value: strings.customDiscoverHeaders.top100})

        setFunction(dataObjects);
    })

    useEffect(()=>{
        const filterList = (list: IData[], filter: string) => {
            let newList: IData[] = []
            list.forEach(listItem => {
                if(listItem.value.toLowerCase().includes(search.toLowerCase())){
                    newList.push(listItem)
                }
            })
            if(filter == strings.filters.author){
                setTempAuthors(newList)
            } else if (filter == strings.filters.subject){
                setTempSubjects((newList))
            } else {
                console.log("Error setting temp ", filter)
            }
        }

        if(search.length == 0){
            setTempAuthors(authors)
            setTempSubjects(subjects)
        } else if (filter == strings.filters.author) {
            filterList(tempAuthors, strings.filters.author)
        } else if (filter == strings.filters.subject){
            filterList(tempSubjects, strings.filters.author)
        } else {
            console.log("Error handling search bar text")
        }
    },[search])

    

    return (
        <View style={styles.container}>
            <TopNav
                title={strings.navbarDiscoverDefaultText}
                stickyHeader={true}
                backButton={false}
            />
            <View style={styles.background}>
                    <SearchBar state={search} setState={setSearch}/>
                <View style={styles.dataSelector}>
                    <DataButton
                        buttonText={"Author"}
                        selected={filter == strings.filters.author}
                        onPress={async () => {
                            await getAuthors().then((res) => formatDataForAlphabetList(res, getAuthors))
                            setFilter(strings.filters.author)
                        }}
                    />
                    <DataButton
                        buttonText={"Subject"}
                        selected={filter == strings.filters.subject}
                        onPress={async () => {
                            await getSubjects().then((res) => {
                                formatDataForAlphabetList(res, setSubjects)
                                formatDataForAlphabetList(res, setTempSubjects)
                            })
                            setFilter(strings.filters.subject)
                        }}
                    />
                </View>
                    <AlphabetList
                        style={styles.scrollView}
                        // TODO check this
                        contentContainerStyle={globalStyles.fullPageScrollView}
                        data={filter == strings.filters.author ? tempAuthors : tempSubjects}
                       
                        uncategorizedAtTop={true}
                        // renderCustomIndexLetter={({ item, index, onPress }: IIndexLetterProps) =>{
                        //     return(
                        //         <TouchableOpacity onPress={()=> onPress} >
                        //             <AppText style={styles.indexLeterText}>{item}</AppText>
                        //         </TouchableOpacity>
                        //     )
                        // }}
                      
                        indexLetterStyle = {styles.indexLeterText}
                        renderCustomItem={(item: IData) => {
                            return (
                                <DiscoverTile
                                    key={Math.random()}
                                    // @ts-ignore
                                    text={item.value}
                                    navigation={navigation}
                                    filter={filter}
                                    query={item.value}
                                />
                            );
                        }}
                        renderCustomSectionHeader={(section) => (
                            <DiscoverSectionHeader label={section.title}/>
                        )}                      
                    />


            </View>
            <BottomNav navigation={navigation} screen={strings.screenName.discover} whatToInclude={IncludeInBottomNav.Nothing}/>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        backgroundColor: "#000",
    },
    background: {
        width: "100%",
        alignItems: "center",
        height: 660,
        backgroundColor: GRAY_6,
    },
    scrollView: {
        // flexGrow: 1,
        width: "100%",
        height: maxWindowSize - 51 - 32 - 33 - 35 - 115,
        // maxWindowSize - search bar height - data button height - search bar padding - data selector padding - add'l value
    },
    dataSelector: {
        flexDirection: "row",
        marginTop: 18,
        justifyContent: "space-between",
        width: 224,
        marginBottom: 17,
    },
    searchContainer: {
        height: "100%",
        width: "100%",
        backgroundColor: LIGHT
    },
    indexFont: {
        fontSize: 10,
        color: PRIMARY_BLUE
    },
    indexLeterText: {
        fontWeight: "800",
        fontSize: 12,
        color: GRAY_1,
        // paddingRight: 10, 
        // paddingTop: 10
    }

});
