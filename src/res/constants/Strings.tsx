import LocalizedStrings from "react-localization";

export const strings = new LocalizedStrings({
    en: {
      screenName: {
        settings: "Settings",
        homeHorizontal: "HomeHorizontal",
        home: "Home",
        discover: "Discover",
        notificationDebugScreen: "Debug Notifications",
        editQuote: "Edit Quotes",
        search: "Search Quotes",
        notificationsScreen: "Configure Notifications",
        notificationSelectorScreen: "Choose Notification Database"
      },
      database: {
        safeChar: "%",
        defaultQuery: "🏆 Top 100",
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
        saveNotificationsButton: "Start Notifications Now",
        newNotificationsSet: "Updated notifications have started 🥳. Head back to the home screen to keep scrolling.",
        saveButton: "Save Changes",
        saveButtonBlank: "Add New Quote",
        editQuoteTitle: "Edit Quote",
        editQuoteTitleBlank: "Add Quote",
        notificationTitle: "ToBeWise",
        shareMessage: "on ToBeWise",
        searchBarTitle: "Search",
        searchBarPlaceholderText: "Enter search query",
        errorMessages:{
          screenFailedToLoad: "Our developer isn't great, his bad code broke the app. Please quit and restart it"
        },
        notificationFrom: "🔔 Notification"
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
      settings: {
        notifications: "Schedule Notifications",
        info: "More Info",
        rateUs: "Rate Us On The App Store",
        share: "Tell A Friend",
        shareMessage: `Immerse yourself in the wisdom of over 900 of the greatest minds in history with ToBeWise™. This app offers you a curated collection of over 2,000 quotations on almost 200 different topics. ToBeWise™ is more than just an app; it's a treasure trove of wisdom from the greatest minds in history. From Aristotle and Socrates to Elon Musk and Steve Jobs, this app brings their wisdom to your fingertips.\n\n💡 Check Out ToBeWise on iOS: https://tobewise.co/`,
        support: "Support",
        terms: "Terms And Conditions",
        ourTeam: "Meet Our Team",
        versionNumberText: "Version Number",
        urls: {
          support: "https://tobewise.co/feedback/",
          terms: "https://tobewise.co/terms/",
          team: "https://tobewise.co/blog/meet-the-team/"
        }
      },

      
      testText: "The AppCopy.tsx text works 💩",
      navbarHomeDefaultText: "Subject: 🏆 Top 100",
      navbarDiscoverDefaultText: "Discover",
    },
  
  });