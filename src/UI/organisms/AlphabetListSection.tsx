import React, { useState, useEffect } from "react";
import { StyleSheet, View, ViewComponent } from "react-native";
import { AlphabetList, IData } from "react-native-section-alphabet-list";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { getFromDB } from "../../res/functions/DBFunctions";
import { DiscoverSectionHeader } from "../atoms/DiscoverSectionHeader";
import { DiscoverTile } from '../molecules/DiscoverTile';
import { maxWindowSize } from "../../res/constants/Values";
import { NavigationInterface } from "../../res/constants/Interfaces";
import { GRAY_1 } from "../../../styles/Colors";
import { DataButton } from "../atoms/DataButton";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  navigation: NavigationInterface
  search: string
}

const formatDataForAlphabetList = (
  (data: String[], setFunction: (arg: IData[]) => void) => {
    const subjectsSet = new Set<string>();
    data.forEach((string) => {
      const subjectArr = string.split(",");
      subjectArr.forEach((subject) => {
        subjectsSet.add(subject.trim());
      });
    });

    const subjectsArr = Array.from(subjectsSet).sort().map((subject) => {
      return { key: Math.random().toString(), value: subject };
    });

    setFunction([
      ...subjectsArr,
      { key: "a", value: strings.customDiscoverHeaders.all },
      { key: "b", value: strings.customDiscoverHeaders.addedByMe },
      { key: "d", value: strings.customDiscoverHeaders.favorites },
      { key: "c", value: strings.customDiscoverHeaders.top100 },
    ]);
  }
);


export const AlphabetListSection = ({ filter, setFilter, navigation, search }: Props) => {
  const [subjects, setSubjects] = useState<IData[]>([]);
  const [authors, setAuthors] = useState<IData[]>([]);

  useEffect(() => {
    // set authors and subjects
    const load = async () => {
      await getFromDB(strings.filters.subject).then((res) => {
        formatDataForAlphabetList(res, setSubjects);
      });
      await getFromDB(strings.filters.author).then((res) => {
        formatDataForAlphabetList(res, setAuthors);
      });
    };
    setFilter(strings.filters.author);
    load();
  }, []);

  const filteredSubjects = subjects.filter((item) =>
    item.value.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAuthors = authors.filter((item) =>
    item.value.toLowerCase().includes(search.toLowerCase())
  );

  const data = filter == strings.filters.author ? filteredAuthors : filteredSubjects;

  return (
    <View style={styles.container}>
      <View style={styles.dataSelector}>
        <DataButton
          buttonText={"Author"}
          selected={filter == strings.filters.author}
          onPress={async () => {
            await getFromDB(strings.filters.author).then((res) =>
              formatDataForAlphabetList(res, setAuthors)
            );
            setFilter(strings.filters.author);
          }}
        />
        <DataButton
          buttonText={"Subject"}
          selected={filter == strings.filters.subject}
          onPress={async () => {
            await getFromDB(strings.filters.subject).then((res) => {
              formatDataForAlphabetList(res, setSubjects);
            });
            setFilter(strings.filters.subject);
          }}
        />
      </View>
      <AlphabetList
        style={styles.scrollView}
        indexLetterContainerStyle={{width: "100%"}}
        indexContainerStyle={{width: 30}}
        contentContainerStyle={globalStyles.fullPageScrollView}
        data={data}
        uncategorizedAtTop={true}
        indexLetterStyle={styles.indexLeterText}
        renderCustomItem={(item: IData) => {
          return (
            <DiscoverTile
              key={item.key}
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
    </View>
  );
};


const styles = StyleSheet.create({
    scrollView: {
        width: "100%",
        height: maxWindowSize - 51 - 32 - 33 - 35 - 115,
    },
    container:{
      width: "100%",
      alignItems: "center",
    },
        dataSelector: {
        flexDirection: "row",
        marginTop: 18,
        justifyContent: "space-between",
        width: 224,
        marginBottom: 17,
    },
    indexLeterText: {
      fontWeight: "800",
      fontSize: 12,
      color: GRAY_1,
      // paddingRight: 10, 
      // paddingTop: 10
  }
});