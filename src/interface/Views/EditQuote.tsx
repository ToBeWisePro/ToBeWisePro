import React, { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { strings } from "../../res/constants/Strings";
import {
  type NavigationInterface,
  type RouteInterface,
} from "../../res/constants/Interfaces";
import { GRAY_5, LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { SaveButton } from "../atoms/SaveButton";
import {
  TextInputField,
  type TextInputProps,
  TextInputSize,
} from "../atoms/TextInputField";
import { TopNav } from "../molecules/TopNav";
import {
  editQuote,
  getQuoteById,
  saveQuoteToDatabase,
} from "../../res/functions/DBFunctions";
import { AppText } from "../atoms/AppText";
import { defaultUsername } from "../../res/constants/Values";
import { TEST_IDS } from "../../res/constants/TestIDs";
interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const EditQuotes = ({ navigation, route }: Props): JSX.Element => {
  const editingQuote = route.params.editingQuote;
  const isExistingQuote = Boolean(route.params.editingExistingQuote);
  const initialQuote = {
    ...editingQuote,
    quoteText: editingQuote.quoteText.length > 0 ? editingQuote.quoteText : "",
    author: editingQuote.author.length > 0 ? editingQuote.author : "",
    subjects: editingQuote.subjects.length > 0 ? editingQuote.subjects : "",
    authorLink:
      editingQuote.authorLink.length > 0 ? editingQuote.authorLink : "",
    videoLink: editingQuote.videoLink.length > 0 ? editingQuote.videoLink : "",
    _id:
      editingQuote._id !== 0
        ? editingQuote._id
        : parseInt(String(Math.random() * 100000)),
  };

  const [quoteInEditing, setQuoteInEditing] = useState(initialQuote);
  const [canSave, setCanSave] = useState(false);
  const [quoteText, setQuoteText] = useState(initialQuote.quoteText);
  const [author, setAuthor] = useState(initialQuote.author);
  const [subjects, setSubjects] = useState(initialQuote.subjects);
  const [authorLink, setAuthorLink] = useState(initialQuote.authorLink);
  const [videoLink, setVideoLink] = useState(initialQuote.videoLink);

  const textInputFields: TextInputProps[] = [
    {
      id: 0,
      placeholderText: strings.placeholderText.quote,
      size: TextInputSize.Large,
      label: strings.labels.quote,
      state: quoteText,
      setState: setQuoteText,
    },
    {
      id: 1,
      placeholderText: strings.placeholderText.author,
      size: TextInputSize.Small,
      label: strings.labels.author,
      state: author,
      setState: setAuthor,
    },
    {
      id: 2,
      placeholderText: strings.placeholderText.subjects,
      size: TextInputSize.Small,
      label: strings.labels.subjects,
      state: subjects,
      setState: setSubjects,
    },
    {
      id: 3,
      placeholderText: strings.placeholderText.videoLink,
      size: TextInputSize.Small,
      label: strings.labels.videoLink,
      state: videoLink,
      setState: setVideoLink,
    },
    {
      id: 4,
      placeholderText: strings.placeholderText.authorLink,
      size: TextInputSize.Small,
      label: strings.labels.authorLink,
      state: authorLink,
      setState: setAuthorLink,
    },
  ];

  useEffect(() => {
    const shouldEnableSave =
      quoteText.length > 0 && subjects.length > 0 && author.length > 0;
    setCanSave(shouldEnableSave);
  }, [quoteText, author, subjects]);

  const getTitle = (): string =>
    isExistingQuote
      ? strings.copy.editQuoteTitle
      : strings.copy.editQuoteTitleBlank;

  return (
    <View style={styles.container}>
      <TopNav
        backButton
        testID={TEST_IDS.topNav}
        title={getTitle()}
        stickyHeader
        backFunction={() => {
          navigation.goBack();
        }}
      />
      <TouchableWithoutFeedback style={styles.form} onPress={Keyboard.dismiss}>
        <ScrollView
          bounces={false}
          style={styles.scrollView}
          contentContainerStyle={{
            justifyContent: "center",
            alignSelf: "center",
            width: "100%",
          }}
        >
          <View style={styles.spacingView}>
            <View style={styles.textInputView}>
              {textInputFields.map((textInputField) => (
                <View key={textInputField.id}>
                  <AppText style={styles.textLabel}>
                    {textInputField.label}
                  </AppText>
                  <View style={styles.outlinedTextContainer}>
                    <TextInputField
                      placeholderText={textInputField.placeholderText}
                      size={textInputField.size}
                      state={textInputField.state}
                      setState={textInputField.setState}
                    />
                  </View>
                </View>
              ))}
            </View>
            <SaveButton
              route={route}
              newQuote={isExistingQuote}
              pressFunction={() => {
                if (quoteInEditing._id === undefined) {
                  console.error("Error: quoteInEditing._id is undefined");
                  return; // Exit the function early
                }
                const updatedQuote = {
                  ...quoteInEditing,
                  quoteText,
                  author,
                  subjects,
                  authorLink,
                  videoLink,
                  _id: quoteInEditing._id,
                  favorite: false,
                  deleted: false,
                  contributedBy: defaultUsername,
                };
                console.log("updatedQuote before save", updatedQuote);
                if (isExistingQuote) {
                  void editQuote(updatedQuote._id, updatedQuote).then(() => {
                    void getQuoteById(updatedQuote._id).then((quote) => {
                      if (quote != null) {
                        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                        setQuoteInEditing(quote);
                      } else {
                        console.log("quote is null");
                      }
                    });
                  });
                } else {
                  void saveQuoteToDatabase(updatedQuote)
                    .then((insertId) => {
                      console.log("insertId", insertId);
                      updatedQuote._id = Number(insertId);
                      console.log("updatedQuote after save", updatedQuote);
                    })
                    .then(() => {
                      void getQuoteById(updatedQuote._id).then((quote) => {
                        if (quote != null) {
                          // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                          setQuoteInEditing(quote);
                        } else {
                          console.log("quote is null");
                        }
                      });
                    });
                }
              }}
              active={canSave}
              navigation={navigation}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    backgroundColor: PRIMARY_BLUE,
  },
  textInputView: {
    paddingBottom: 25,
    width: "100%",
  },
  form: {
    marginTop: 20,
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  spacingView: {
    paddingBottom: 400,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: GRAY_5,
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
  },
  scrollView: {
    width: "100%",
    alignSelf: "center",
  },
  outlinedTextContainer: {
    backgroundColor: LIGHT,
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
    marginVertical: 10,
  },
  textLabel: {
    fontWeight: "bold",
  },
});
