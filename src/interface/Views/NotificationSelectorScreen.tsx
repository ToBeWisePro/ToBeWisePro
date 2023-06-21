import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TopNav } from "../molecules/TopNav";
import { strings } from "../../res/constants/Strings";
import { maxWindowSize } from "../../res/constants/Values";
import { IData } from "react-native-section-alphabet-list";
import { GRAY_1, GRAY_6, LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { BottomNav } from "../organisms/BottomNav";
import { NavigationInterface } from "../../res/constants/Interfaces";
import { SearchBar } from "../molecules/SearchBar";
import { IncludeInBottomNav } from "../../res/constants/Enums";
import { getAllQuotes, getFromDB, getShuffledQuotes } from "../../res/functions/DBFunctions";
import { AlphabetListSection } from "../organisms/AlphabetListSection";
import {
  SETTINGS_KEYS,
  loadSettings,
  saveSettings,
} from "./NotificationsScreen";
import { scheduleNotifications } from "../../res/util/NotificationScheduler";

interface Props {
  navigation: NavigationInterface;
}

export const NotificationSelectorScreen = ({ navigation }: Props) => {
  const [subjects, setSubjects] = useState<IData[]>([]);
  const [authors, setAuthors] = useState<IData[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [tempSubjects, setTempSubjects] = useState<IData[]>([]);
  const [tempAuthors, setTempAuthors] = useState<IData[]>([]);
  const [reinitialize, setReinitialize] = useState<number>(0);

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
    data: String[],
    setFunction: (arg: IData[]) => void
  ) => {
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

  /**
 * This function updates the temporary list of authors and subjects based on the search text entered by the user.
 * If the search text is empty, the temporary lists are reset to the original authors and subjects.
 * If the filter is "author", the function filters the temporary authors list and updates it.
 * If the filter is "subject", the function filters the temporary subjects list and updates it.

 */
  useEffect(() => {
    const filterList = (list: IData[], filter: string) => {
      let newList: IData[] = [];
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
        title={"Select Notification Database"}
        stickyHeader={true}
        backButton={false}
      />
      <View style={styles.background}>
        <SearchBar state={search} setState={setSearch} />
        <AlphabetListSection
          navigation={navigation}
          data={filter == strings.filters.author ? tempAuthors : tempSubjects}
          filter={filter}
          setFilter={setFilter}
          search={search}
          onPress={async (query: string, filter: string) => {
            console.log("Saving query:-", query, "-and filter:-", filter);
            await getShuffledQuotes(query, filter)
              .then((res) => {
                console.log(res.length);
              })
              .then(async () => {
                await saveSettings(SETTINGS_KEYS.query, query)
                  .then(async () => {
                    await saveSettings(SETTINGS_KEYS.filter, filter);
                  })
                  .then(async () => {
                    await scheduleNotifications().then(() => {
                      navigation.goBack();
                    });
                  });
              });
          }}
        />
      </View>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.discover}
        whatToInclude={IncludeInBottomNav.Nothing}
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
