import LocalizedStrings from "react-localization";

export const strings = new LocalizedStrings({
  en: {
    screenName: {
      settings: "Settings",
      homeHorizontal: "HomeHorizontal",
      home: "Home",
      discover: "Discover",
      editQuote: "Edit Quotes",
      search: "Search Quotes",
      notificationsScreen: "Configure Notifications",
      notificationSelectorScreen: "Choose Notification Database",
      firstLogin: "First Login",
    },
    database: {
      safeChar: "%",
      defaultQuery: "🏆 Top 100",
      defaultFilter: "Subject",
    },
    filters: {
      author: "Author",
      subject: "Subject",
    },
    placeholderText: {
      author: "Author...",
      quote: "Quotation...",
      subjects: "Category 1, Category 2, ...",
      authorLink: "www.author.link",
      videoLink: "www.video.link",
    },
    labels: {
      author: "*Author",
      quote: "*Quotation",
      authorLink: "Link To Author",
      videoLink: "Link To Video",
      subjects: "*Subjects (comma separated)",
    },
    copy: {
      firstLoginHeader: "Welcome to ToBeWise!",
      finalNotification:
        "The chosen set of  quotations has been fully played out. Please tap here to reload the app and choose a Subject or Author for more notifications",
      saveNotificationsButton: "Start Notifications Now",
      countZeroErrorText:
        "Please select an author or filter with more than 0 quotes",
      newNotificationsSet: "Updated notifications are on their way 🥳",
      saveButton: "Save Changes",
      saveButtonBlank: "Add New Quote",
      editQuoteTitle: "Edit Quote",
      editQuoteTitleBlank: "Add Quote",
      notificationTitle: "ToBeWise",
      shareMessage: "on ToBeWise",
      searchBarTitle: "Search",
      searchBarPlaceholderText: "Enter search query",
      errorMessages: {
        screenFailedToLoad:
          "Our developer isn't great, his bad code broke the app. Please quit and restart it",
      },
      notificationFrom: "🔔 Notification",
    },
    playPauseButtons: {
      play: "play-circle-outline",
      pause: "pause",
      slowDown: "fast-rewind",
      speedUp: "fast-forward",
    },
    customDiscoverHeaders: {
      all: "🌏 Show All",
      addedByMe: "🙋 Contributed By Me",
      deleted: "🗑️ Deleted",
      favorites: "❤️ Favorite Quotations",
      top100: "🏆 Top 100",
      recent: "🕒 Recently Added",
    },
    settings: {
      notifications: "Schedule Notifications",
      info: "ToBeWise Website",
      rateUs: "Rate Us On The App Store",
      share: "Tell A Friend",
      introVideo: "How To Best User ToBeWise",
      shareMessage:
        "Immerse yourself in the wisdom of over 900 of the greatest minds in history with ToBeWise™. This app offers you a curated collection of over 2,000 quotations on almost 200 different topics. ToBeWise™ is more than just an app; it's a treasure trove of wisdom from the greatest minds in history. From Aristotle and Socrates to Elon Musk and Steve Jobs, this app brings their wisdom to your fingertips.\n\n💡 Check Out ToBeWise on iOS: https://tobewise.co/",
      support: "Support",
      terms: "Terms And Conditions",
      ourTeam: "Meet Our Team",
      versionNumberText: "Version Number",
      urls: {
        support: "https://tobewise.co/feedback/",
        terms: "https://tobewise.co/terms/",
        team: "https://tobewise.co/blog/meet-the-team/",
        howToGuide: "https://tobewise.co/blog/why-and-how-to-use-tobewise/",
      },
    },

    testText: "The AppCopy.tsx text works 💩",
    navbarHomeDefaultText: "Subject: 🏆 Top 100",
    navbarDiscoverDefaultText: "Discover",
  },
});
