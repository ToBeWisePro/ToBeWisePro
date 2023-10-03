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
import { IncludeInBottomNav, ASYNC_KEYS } from "../../res/constants/Enums";
import { getFromDB } from "../../res/functions/DBFunctions";
import { AlphabetListSection } from "../organisms/AlphabetListSection";
import { saveSettings } from "./NotificationsScreen";
import { TEST_IDS } from "../../res/constants/TestIDs";
import { scheduleNotifications } from "../../res/util/NotificationScheduler";

interface Props {
  navigation: NavigationInterface;
}

export const NotificationSelectorScreen = ({
  navigation,
}: Props): JSX.Element => {
  const [subjects, setSubjects] = useState<IData[]>([]);
  const [authors, setAuthors] = useState<IData[]>([]);
  const [filter, setFilter] = useState<string>(strings.filters.subject);
  const [search, setSearch] = useState<string>("");
  const [tempSubjects, setTempSubjects] = useState<IData[]>([]);
  const [tempAuthors, setTempAuthors] = useState<IData[]>([]);

  useEffect(() => {
    // set authors and subjects
    const load = async (): Promise<void> => {
      await getFromDB(strings.filters.subject).then((res) => {
        formatDataForAlphabetList(res, setSubjects);
      });
      await getFromDB(strings.filters.author).then((res) => {
        formatDataForAlphabetList(res, setAuthors);
        formatDataForAlphabetList(res, setTempAuthors);
      });
    };
    setFilter(strings.filters.subject);

    void load();
  }, []);

  const formatDataForAlphabetList = (
    data: string[],
    setFunction: (arg: IData[]) => void,
  ): void => {
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
        title={"Select Notification Database"}
        stickyHeader={true}
        backButton={false}
        testID={TEST_IDS.topNav}
      />
      <View style={styles.background}>
        <SearchBar state={search} setState={setSearch} />
        <AlphabetListSection
          navigation={navigation}
          filter={filter}
          setFilter={setFilter}
          search={search}
          onPress={async (query: string, filter: string) => {
            await saveSettings(ASYNC_KEYS.notificationQuery, query).then(
              async () => {
                await saveSettings(ASYNC_KEYS.notificationFilter, filter);
              },
            );
            void scheduleNotifications();
            navigation.goBack();
          }}
          testID={TEST_IDS.alphabetListSection}
        />
      </View>
      <BottomNav
        navigation={navigation}
        screen={strings.screenName.discover}
        whatToInclude={IncludeInBottomNav.Nothing}
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
