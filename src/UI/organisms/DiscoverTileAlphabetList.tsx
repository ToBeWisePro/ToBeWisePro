import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { AlphabetList, IData } from "react-native-section-alphabet-list";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { getFromDB } from "../../res/functions/DBFunctions";
import { DataButton } from "../atoms/DataButton";
import { DiscoverSectionHeader } from "../atoms/DiscoverSectionHeader";
import { SearchBar } from "../molecules/SearchBar";
import { DiscoverTile } from '../molecules/DiscoverTile';
import { maxWindowSize } from "../../res/constants/Values";
import { NavigationInterface } from "../../res/constants/Interfaces";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  navigation: NavigationInterface
  search: string
}

export const AlphabetListSection = ({ filter, setFilter, navigation, search }: Props) => {
  const [subjects, setSubjects] = useState<IData[]>([]);
  const [authors, setAuthors] = useState<IData[]>([]);
  const [tempSubjects, setTempSubjects] = useState<IData[]>([]);
  const [tempAuthors, setTempAuthors] = useState<IData[]>([]);
  useEffect(() => {
    // set authors and subjects
    const load = async () => {
      await getFromDB(strings.filters.subject).then((res) => {
        formatDataForAlphabetList(res, setSubjects);
      });
      await getFromDB(strings.filters.author).then((res) => {
        formatDataForAlphabetList(res, setAuthors);
        formatDataForAlphabetList(res, setTempAuthors);
      });
    };
    setFilter(strings.filters.author);

    load();
  }, []);

  const formatDataForAlphabetList = (
    (data: String[], setFunction: (arg: IData[]) => void) => {
      // AlphabetList requires {key, value} so we have to take our strings and convert them to key value pairs
      const dataObjects: IData[] = [];
      data.forEach((string) => {
        // @ts-ignore
        dataObjects.push({ key: Math.random().toString(), value: string });
      });
      dataObjects.push({ key: "a", value: strings.customDiscoverHeaders.all });
      dataObjects.push({
        key: "b",
        value: strings.customDiscoverHeaders.addedByMe,
      });
      // dataObjects.push({key:"e", value: strings.customDiscoverHeaders.deleted})
      dataObjects.push({
        key: "d",
        value: strings.customDiscoverHeaders.favorites,
      });
      dataObjects.push({
        key: "c",
        value: strings.customDiscoverHeaders.top100,
      });

      setFunction(dataObjects);
    }
  );

  useEffect(() => {
    const filterList = (list: IData[], filter: string) => {
      let newList: IData[] = [];
      list.forEach((listItem) => {
        if (listItem.value.toLowerCase().includes(search.toLowerCase())) {
          newList.push(listItem);
        }
      });
      if (filter == strings.filters.author) {
        setTempAuthors(newList);
      } else if (filter == strings.filters.subject) {
        setTempSubjects(newList);
      } else {
        console.log("Error setting temp ", filter);
      }
    };

    if (search.length == 0) {
      setTempAuthors(authors);
      setTempSubjects(subjects);
    } else if (filter == strings.filters.author) {
      filterList(tempAuthors, strings.filters.author);
    } else if (filter == strings.filters.subject) {
      filterList(tempSubjects, strings.filters.author);
    } else {
      console.log("Error handling search bar text");
    }
  }, [search]);
  return (
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

      indexLetterStyle={styles.indexLeterText}
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
        <DiscoverSectionHeader label={section.title} />
      )}
    />
  );
};

const styles = StyleSheet.create({
    scrollView: {
        width: "100%",
        height: maxWindowSize - 51 - 32 - 33 - 35 - 115,
    },
});