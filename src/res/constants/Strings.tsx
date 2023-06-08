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
        notificationsScreen: "Configure Notifications"
      },
      database: {
        safeChar: "%",
        defaultQuery: "Top 100",
        defaultFilter: "Subject",
      },
      filters: {
        author: "Author",
        subject: "Subject"
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
        subjects: "*Subjects (comma separated)"
      },
      copy: {
        saveButton: "Save Changes",
        saveButtonBlank: "Add New Quote",
        editQuoteTitle: "Edit Quote",
        editQuoteTitleBlank: "Add Quote",
        shareMessage: "on ToBeWise",
        searchBarTitle: "Search",
        searchBarPlaceholderText: "Enter search query",
        errorMessages:{
          screenFailedToLoad: "Our developer isn't great, his bad code broke the app. Please quit and restart it"
        },
      },
      playPauseButtons: {
        play: "play-circle-outline",
        pause: "pause",
        slowDown: "fast-rewind",
        speedUp: "fast-forward"
      },
      customDiscoverHeaders:{
        all: "🌏 Show All",
        addedByMe: "🙋 Contributed By Me",
        deleted: "🗑️ Deleted",
        favorites: "❤️ Favorite Quotations",
        top100: "🏆 Top 100"
      },
      
      testText: "The AppCopy.tsx text works 💩",
      navbarHomeDefaultText: "Subject: 🏆 Top 100",
      navbarDiscoverDefaultText: "Discover",
    },
  
  });