import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { AlphabetList, IData } from "react-native-section-alphabet-list";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { getFromDB, getQuoteCount } from "../../res/functions/DBFunctions";
import { DiscoverSectionHeader } from "../atoms/DiscoverSectionHeader";
import { DiscoverTile } from '../molecules/DiscoverTile';
import { maxWindowSize } from "../../res/constants/Values";
import { NavigationInterface } from "../../res/constants/Interfaces";
import { ScrollView } from "react-native-gesture-handler";

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
useEffect(() => {
  const filterData = (data: IData[], filter: string) => {
    const filteredData = data.filter((item) =>
      item.value.toLowerCase().includes(search.toLowerCase())
    );
    if (filter === strings.filters.author) {
      setTempAuthors(filteredData);
    } else if (filter === strings.filters.subject) {
      setTempSubjects(filteredData);
    } else {
      console.log("Error setting temp ", filter);
    }
  };

  if (search.length === 0) {
    setTempAuthors(authors);
    setTempSubjects(subjects);
  } else if (filter === strings.filters.author) {
    filterData(tempAuthors, strings.filters.author);
  } else if (filter === strings.filters.subject) {
    filterData(tempSubjects, strings.filters.subject);
  } else {
    console.log("Error handling search bar text");
  }
}, [search]);

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


 
  return (
    <AlphabetList
      style={styles.scrollView}
      // TODO check this
      contentContainerStyle={globalStyles.fullPageScrollView}
      data={filter == strings.filters.author ? tempAuthors : tempSubjects}
      uncategorizedAtTop={true}
      indexLetterStyle={styles.indexLeterText}
      renderCustomItem={(item: IData) => {
        return (
          <DiscoverTile
            key={item.key}
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