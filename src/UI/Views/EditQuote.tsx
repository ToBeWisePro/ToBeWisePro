import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { defaultUsername } from "../../res/constants/Values";
import { strings } from "../../res/constants/Strings";
import {
  NavigationInterface,
  QuotationInterface,
  RouteInterface,
} from "../../res/constants/Interfaces";
import { LIGHT, PRIMARY_BLUE } from "../../../styles/Colors";
import { SaveButton } from "../atoms/SaveButton";
import {
  TextInputField,
  TextInputProps,
  TextInputSize,
} from "../atoms/TextInputField";
import { TopNav } from "../molecules/TopNav";
import { addQuote, editQuote, getQuoteByID } from "../../res/functions/DBFunctions";
interface Props {
  navigation: NavigationInterface;
  route: RouteInterface;
}

export const EditQuotes = ({ navigation, route }: Props) => {
  const [canSave, setCanSave] = useState(false);
  const [quoteInEditing, setQuoteInEditing] = useState(
    route.params.editingQuote
  );
  const [quoteText, setQuoteText] = useState(
    route.params.editingQuote.quoteText
  );
  const [author, setAuthor] = useState(route.params.editingQuote.author);
  const [subjects, setSubjects] = useState(route.params.editingQuote.subjects);
  const [authorLink, setAuthorLink] = useState(
    route.params.editingQuote.authorLink
  );
  const [videoLink, setVideoLink] = useState(
    route.params.editingQuote.videoLink
  );
  const [existingQuote, setIsExistingQuote] = useState(
    route.params.editingQuote.quoteText.length > 0
  );

  useEffect(() => {
    setQuoteText(route.params.editingQuote.quoteText);
    setAuthor(route.params.editingQuote.author);
    setSubjects(route.params.editingQuote.subjects);
    setAuthorLink(route.params.editingQuote.authorLink);
    setVideoLink(route.params.editingQuote.videoLink);
  }, []);

  const textInputFields: TextInputProps[] = [
    {
      id: 0,
      placeholderText: strings.placeholderText.quote,
      size: TextInputSize.Large,
      label: strings.labels.quote,
      state: quoteText,
      setState: (e) => setQuoteText(e),
    },
    {
      id: 1,
      placeholderText: strings.placeholderText.author,
      size: TextInputSize.Small,
      label: strings.labels.author,
      state: author,
      setState: (e) => setAuthor(e),
    },
    {
      id: 2,
      placeholderText: strings.placeholderText.subjects,
      size: TextInputSize.Small,
      label: strings.labels.subjects,
      state: subjects,
      setState: (e) => setSubjects(e),
    },
    {
      id: 4,
      placeholderText: strings.placeholderText.videoLink,
      size: TextInputSize.Small,
      label: strings.labels.videoLink,
      state: videoLink,
      setState: (e) => setVideoLink(e),
    },
    {
      id: 5,
      placeholderText: strings.placeholderText.authorLink,
      size: TextInputSize.Small,
      label: strings.labels.authorLink,
      state: authorLink,
      setState: (e) => setAuthorLink(e),
    },
  ];

  useEffect(() => {
    // every time a field is edited, update the text fields to display the changes
    setQuoteText(quoteInEditing.quoteText);
    setSubjects(quoteInEditing.subjects);
    setAuthorLink(quoteInEditing.authorLink);
    setAuthor(quoteInEditing.author);
    setVideoLink(quoteInEditing.videoLink);
    setCanSave(false);
  }, [quoteInEditing]);

  useEffect(()=>{
      if (
        quoteText.length > 0 &&
        subjects.length > 0 &&
        author.length > 0
      ) {
        setCanSave(true);
      }
  },[author, quoteText, subjects])

  useEffect(
    () =>{
      route.params.editingQuote.quoteText.length > 0
        ? setIsExistingQuote(true)
        : setIsExistingQuote(false)
    },
    []
  );

  const saveEdit = async () => {
    setCanSave(true);
    const tempQuote: QuotationInterface = {
      _id: route.params.editingQuote._id,
      quoteText: quoteText,
      author: author,
      authorLink: authorLink,
      videoLink: videoLink,
      subjects: subjects,
      favorite: route.params.editingQuote.favorite,
      contributedBy: defaultUsername,
    };
    if (existingQuote) {
      await editQuote(tempQuote);
    } else await addQuote(tempQuote);

    setQuoteInEditing(tempQuote);
  };

  const getTitle = () => {
    if (existingQuote) {
      return strings.copy.editQuoteTitle;
    } else return strings.copy.editQuoteTitleBlank;
    // if there's a quote, set to "Edit Quote". Otherwise, set to "Add Quote"
  };

  return (
    <View style={styles.container}>
      <TopNav
        backButton={true}
        title={getTitle()}
        stickyHeader={true}
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
          <View style={styles.spacingView} >
            <View style={styles.textInputView} >
              {textInputFields.map((textInputField) => (
                <View style={styles.shadowContainer} >
                  <TextInputField
                    placeholderText={textInputField.placeholderText}
                    size={textInputField.size}
                    label={textInputField.label}
                    state={textInputField.state}
                    setState={(e)=> {textInputField.setState(e)}}
                    // key={Math.random().toString()}
                  />
                </View>
              ))}
            </View>
            <SaveButton
              route={route}
              newQuote={existingQuote}
              pressFunction={() => {
                saveEdit().then(async () => {
                  const quote: QuotationInterface = await getQuoteByID(
                    quoteInEditing._id
                  );
                  setQuoteInEditing(quote);
                });
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
    width: Dimensions.get("window").width,
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
    backgroundColor: LIGHT,
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
  },
  scrollView: {
    width: "100%",
    alignSelf: "center",
  },
  shadowContainer: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 5,
    marginVertical: 10,
  },
});
