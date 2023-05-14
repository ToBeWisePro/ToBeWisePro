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
  NavigationInterface,
  QuotationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { GRAY_5, LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { SaveButton } from "../atoms/SaveButton";
import {
  TextInputField,
  TextInputProps,
  TextInputSize,
} from "../atoms/TextInputField";
import { TopNav } from "../molecules/TopNav";
import {
  editQuote,
  getQuoteById,
  removeQuote,
  saveQuoteToDatabase,
} from "../../res/functions/DBFunctions";
import { AppText } from "../atoms/AppText";
interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const EditQuotes = ({ navigation, route }: Props) => {
  const editingQuote = route.params.editingQuote || {};
  const isExistingQuote = Boolean(editingQuote);
  const initialQuote = {
    ...editingQuote,
    quoteText: editingQuote.quoteText || "",
    author: editingQuote.author || "",
    subjects: editingQuote.subjects || "",
    authorLink: editingQuote.authorLink || "",
    videoLink: editingQuote.videoLink || "",
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

  const getTitle = () =>
    isExistingQuote
      ? strings.copy.editQuoteTitle
      : strings.copy.editQuoteTitleBlank;

  return (
    <View style={styles.container}>
      <TopNav
        backButton
        title={getTitle()}
        stickyHeader
        backFunction={() => navigation.goBack()}
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
              pressFunction={async () => {
                const updatedQuote = {
                  ...quoteInEditing,
                  quoteText,
                  author,
                  subjects,
                  authorLink,
                  videoLink,
                  favorite: false,
                  deleted: false,
                  contributedBy: "user",
                };
                console.log("updatedQuote before save", updatedQuote);
                if (isExistingQuote) {
                  editQuote(updatedQuote._id, updatedQuote).then(async () => {
                    const quote: QuotationInterface | null = await getQuoteById(
                      updatedQuote._id
                    );
                    if (quote) {
                      setQuoteInEditing(quote);
                    } else {
                      console.log("quote is null");
                    }
                  });
                } else {
                  await saveQuoteToDatabase(updatedQuote).then(
                    async (insertId) => {
                      console.log("insertId", insertId);
                      updatedQuote._id = insertId; // Add the _id attribute to updatedQuote

                      console.log("updatedQuote after save", updatedQuote);
                      const quote: QuotationInterface | null =
                        await getQuoteById(updatedQuote._id);
                      if (quote) {
                        setQuoteInEditing(quote);
                      } else {
                        console.log("quote is null");
                      }
                    }
                  );
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
