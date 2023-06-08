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

interface Props {
  filter: string;
  setFilter: (filter: string) => void;
  navigation: NavigationInterface;
  search: string;
}

const formatDataForAlphabetList = (data: String[]) => {
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

  return { finalData, count: subjectsArr.length };
};

export const AlphabetListSection = ({
  filter,
  setFilter,
  navigation,
  search,
}: Props) => {
  const [subjects, setSubjects] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [authorsCount, setAuthorsCount] = useState(0);

  useEffect(() => {
    // set authors and subjects
    const load = async () => {
      await getFromDB(strings.filters.subject).then((res) => {
        const { finalData, count } = formatDataForAlphabetList(res);
        setSubjects(finalData);
        setSubjectsCount(count);
      });
      await getFromDB(strings.filters.author).then((res) => {
        const { finalData, count } = formatDataForAlphabetList(res);
        setAuthors(finalData);
        setAuthorsCount(count);
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

  return (
    <View style={styles.container}>
      <View style={styles.dataSelector}>
        <DataButton
          buttonText={"Author"}
          selected={filter == strings.filters.author}
          onPress={async () => {
            const { finalData, count } = await getFromDB(
              strings.filters.author
            ).then(formatDataForAlphabetList);
            setAuthors(finalData);
            setAuthorsCount(count);
            setFilter(strings.filters.author);
          }}
        />
        <DataButton
          buttonText={"Subject"}
          selected={filter == strings.filters.subject}
          onPress={async () => {
            const { finalData, count } = await getFromDB(
              strings.filters.subject
            ).then(formatDataForAlphabetList);
            setSubjects(finalData);
            setSubjectsCount(count);
            setFilter(strings.filters.subject);
          }}
        />
      </View>
      <AlphabetList
        style={styles.scrollView}
        indexLetterContainerStyle={{ width: "100%" }}
        indexContainerStyle={{ width: 30 }}
        contentContainerStyle={globalStyles.fullPageScrollView}
        data={data}
        uncategorizedAtTop={true}
        indexLetterStyle={styles.indexLetterText}
        renderCustomItem={(item) => {
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
      <Text style={styles.countText}>
        Total {filter == strings.filters.author ? "Authors" : "Subjects"} ={" "}
        {filter == strings.filters.author ? authorsCount : subjectsCount}
      </Text>
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
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
