import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { AlphabetList } from "react-native-section-alphabet-list";
import { globalStyles } from "../../../styles/GlobalStyles";
import { strings } from "../../res/constants/Strings";
import { getFromDB } from "../../res/functions/DBFunctions";
import { DiscoverSectionHeader } from "../atoms/DiscoverSectionHeader";
import { DiscoverTile } from "../molecules/DiscoverTile";
import { maxWindowSize } from "../../res/constants/Values";
import { NavigationInterface } from "../../res/constants/Interfaces";
import { GRAY_1 } from "../../../styles/Colors";
import { DataButton } from "../atoms/DataButton";
import { AppText } from "../atoms/AppText";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  navigation: NavigationInterface;
  search: string;
  onPress?: (query: string, filter: string) => Promise<void>;
}

export const AlphabetListSection = ({
  filter,
  setFilter,
  navigation,
  search,
  onPress,
}: Props) => {
  const [subjects, setSubjects] = useState([]);
  const [authors, setAuthors] = useState([]);

  const formatDataForAlphabetList = (data: String[]) => {
    if (!data) return [];

    const subjectsSet = new Set<string>();
    data.forEach((string) => {
      const subjectArr = string.split(",");
      subjectArr.forEach((subject) => {
        subjectsSet.add(subject.trim());
      });
    });

    const subjectsArr = Array.from(subjectsSet)
      .sort()
      .map((subject) => {
        return { key: Math.random().toString(), value: subject };
      });

    const finalData = [
      ...subjectsArr,
      { key: "a", value: strings.customDiscoverHeaders.all },
      { key: "b", value: strings.customDiscoverHeaders.addedByMe },
      { key: "d", value: strings.customDiscoverHeaders.favorites },
      { key: "c", value: strings.customDiscoverHeaders.top100 },
      { key: "e", value: strings.customDiscoverHeaders.deleted },
    ];

    return finalData;
  };

  useEffect(() => {
    // set authors and subjects
    const load = async () => {
      await getFromDB(strings.filters.subject).then((res) => {
        const finalData = formatDataForAlphabetList(res);
        setSubjects(finalData);
      });
      await getFromDB(strings.filters.author).then((res) => {
        const finalData = formatDataForAlphabetList(res);
        setAuthors(finalData);
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

  const data =
    filter == strings.filters.author ? filteredAuthors : filteredSubjects;
  console.log(data.slice(0, 20));
  return (
    <View style={styles.container}>
      <View style={styles.dataSelector}>
        <DataButton
          buttonText={"Author"}
          selected={filter == strings.filters.author}
          onPress={async () => {
            // save query and filter to AsyncStorage

            const finalData = await getFromDB(strings.filters.author).then(
              (res) => formatDataForAlphabetList(res)
            );
            setAuthors(finalData);
            setFilter(strings.filters.author);
          }}
        />
        <DataButton
          buttonText={"Subject"}
          selected={filter == strings.filters.subject}
          onPress={async () => {
            const finalData = await getFromDB(strings.filters.subject).then(
              (res) => formatDataForAlphabetList(res)
            );
            setSubjects(finalData);
            setFilter(strings.filters.subject);
          }}
        />
      </View>
      <AlphabetList
        style={styles.scrollView}
        indexLetterContainerStyle={{ width: 40, height: 17, marginRight: 7 }}
        indexContainerStyle={{ width: 30 }}
        contentContainerStyle={{ paddingBottom: 125 }}
        data={data}
        uncategorizedAtTop={true}
        indexLetterStyle={
          search ? styles.indexLetterTextClear : styles.indexLetterText
        }
        renderCustomItem={(item) => {
          console.log(item);
          return (
            <DiscoverTile
              key={item.key}
              text={item.value}
              navigation={navigation}
              filter={filter}
              query={item.value}
              onPress={onPress}
            />
          );
        }}
        renderCustomSectionHeader={(section) => (
          <DiscoverSectionHeader label={section.title} />
        )}
        ListFooterComponent={
          <AppText style={styles.countText}>Total items: {data.length}</AppText>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
    height: maxWindowSize - 51 - 32 - 33 - 35 - 115,
  },
  container: {
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
  indexLetterText: {
    fontWeight: "800",
    fontSize: 12,
    color: GRAY_1,
  },
  indexLetterTextClear: {
    fontWeight: "800",
    fontSize: 12,
    color: "transparent",
  },
  countText: {
    fontSize: 16,
    margin: 5,
  },
});
