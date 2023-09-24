import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TopNav } from "../molecules/TopNav";
import { strings } from "../../res/constants/Strings";
import { maxWindowSize } from "../../res/constants/Values";
import { type IData } from "react-native-section-alphabet-list";
import { GRAY_6, LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { BottomNav } from "../organisms/BottomNav";
import { type NavigationInterface } from "../../res/constants/Interfaces";
import { SearchBar } from "../molecules/SearchBar";
import { ASYNC_KEYS, IncludeInBottomNav } from "../../res/constants/Enums";
import { getFromDB } from "../../res/functions/DBFunctions";
import { AlphabetListSection } from "../organisms/AlphabetListSection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TEST_IDS } from "../../res/constants/TestIDs";

interface Props {
  navigation: NavigationInterface;
}

export const Discover = ({ navigation }: Props): JSX.Element => {
  const [subjects, setSubjects] = useState<IData[]>([]);
  const [authors, setAuthors] = useState<IData[]>([]);
  const [filter, setFilter] = useState<string>(strings.database.defaultFilter);
  const [search, setSearch] = useState<string>("");
  const [tempSubjects, setTempSubjects] = useState<IData[]>([]); // used for search
  const [tempAuthors, setTempAuthors] = useState<IData[]>([]); // used for search

  useEffect(() => {
    // set authors and subjects
    const load = async (): Promise<void> => {
      const storedFilter = await AsyncStorage.getItem(ASYNC_KEYS.filter);
      if (storedFilter != null) {
        setFilter(storedFilter);
      } else {
        setFilter(strings.filters.author);
      }
      await getFromDB(strings.filters.subject).then((res) => {
        formatDataForAlphabetList(res, setSubjects);
      });
      await getFromDB(strings.filters.author).then((res) => {
        formatDataForAlphabetList(res, setAuthors);
        formatDataForAlphabetList(res, setTempAuthors);
      });
    };
    setFilter(strings.filters.author);

    void load();
  }, []);

  const formatDataForAlphabetList = (
    data: string[],
    setFunction: (arg: IData[]) => void,
  ): void => {
    // AlphabetList requires {key, value} so we have to take our strings and convert them to key value pairs
    const dataObjects: IData[] = [];
    data.forEach((string) => {
      dataObjects.push({ key: Math.random().toString(), value: string });
    });
    dataObjects.push({ key: "a", value: strings.customDiscoverHeaders.all });
    dataObjects.push({
      key: "b",
      value: strings.customDiscoverHeaders.addedByMe,
    });
    dataObjects.push({
      key: "e",
      value: strings.customDiscoverHeaders.deleted,
    });
    dataObjects.push({
      key: "d",
      value: strings.customDiscoverHeaders.favorites,
    });
    dataObjects.push({ key: "c", value: strings.customDiscoverHeaders.top100 });

    setFunction(dataObjects);
  };

  useEffect(() => {
    const filterList = (list: IData[], filter: string): void => {
      const newList: IData[] = [];
      list.forEach((listItem) => {
        if (listItem.value.toLowerCase().includes(search.toLowerCase())) {
          newList.push(listItem);
        }
      });
      if (filter === strings.filters.author) {
        setTempAuthors(newList);
      } else if (filter === strings.filters.subject) {
        setTempSubjects(newList);
      } else {
        console.log("Error setting temp ", filter);
      }
    };

    if (search.length === 0) {
      setTempAuthors(authors);
      setTempSubjects(subjects);
    } else if (filter === strings.filters.author) {
      filterList(tempAuthors, strings.filters.author);
    } else if (filter === strings.filters.subject) {
      filterList(tempSubjects, strings.filters.subject);
    } else {
      console.log("Error handling search bar text");
    }
  }, [search]);

  return (
    <View style={styles.container}>
      <TopNav
        title={strings.navbarDiscoverDefaultText}
        stickyHeader={true}
        backButton={false}
        testID={TEST_IDS.topNav}
      />
      <View style={styles.background}>
        <SearchBar state={search} setState={setSearch} />
        <AlphabetListSection
          testID={TEST_IDS.alphabetListSection}
          navigation={navigation}
          filter={filter}
          setFilter={setFilter}
          search={search}
          onPress={async (query, filter) => {
            await AsyncStorage.setItem(ASYNC_KEYS.query, query);
            await AsyncStorage.setItem(ASYNC_KEYS.filter, filter);
            navigation.navigate(strings.screenName.home);
          }}
        />
      </View>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.discover}
        whatToInclude={IncludeInBottomNav.Nothing}
        testID={TEST_IDS.bottomNav}
        playPressed={false}
        scrollSpeed={0}
      />
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

  searchContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: LIGHT,
  },
  indexFont: {
    fontSize: 10,
    color: PRIMARY_BLUE,
  },
});
