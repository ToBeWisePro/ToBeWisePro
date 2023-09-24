export enum Frequencies {
  "15 Minutes",
  "30 Minutes",
  "1 Hour",
  "2 Hours",
  "4 Hours",
  "6 Hours",
}

export enum BackButtonNavEnum {
  GoBack,
  ResetHomeScreen,
}

export enum QuoteContainerButtons {
  Add = "Add",
  Delete = "Delete",
  Edit = "Edit",
  Video = "Video",
  Favorite = "Favorite",
  Share = "Share",
}

export enum ContainerSize {
  Large,
  Small,
}

export enum NotificationsMenuOptionEnum {
  Toggle,
  TimeSelector,
  DBSelector,
  TextField,
  FrequencySelector,
}

export enum IncludeInBottomNav {
  AutoScrollBar,
  PlayButton,
  Nothing,
}

export const ASYNC_KEYS = {
  allowNotifications: "allowNotifications",
  startTime: "startTime",
  endTime: "endTime",
  spacing: "spacing",
  query: "query",
  filter: "filter",
  notifTitle: "notifTitle",
  notifQuote: "notifQuote",
  frequency: "frequency",
  notificationQuery: "notificationQuery",
  notificationFilter: "notificationFilter",
  scrollSpeed: "@scrollspeed",
};
