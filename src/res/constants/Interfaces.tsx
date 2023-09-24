import {
  type BackButtonNavEnum,
  type NotificationsMenuOptionEnum,
} from "./Enums";

export interface RouteInterface {
  params: {
    currentQuotes: QuotationInterface[];
    editingQuote: QuotationInterface;
    quoteSearch: {
      filter: string;
      query: string;
    };
    editingExistingQuote: boolean;
    showBackButton: boolean;
    backButtonNavigationFunction: BackButtonNavEnum;
    notificationKey: string;
    notificationFilter: string;
  };
}

export interface NavigationInterface {
  addListener: any;
  // eslint-disable-next-line no-empty-pattern
  push: (ev: string, {}) => void;
  goBack: () => void;
  navigate: (e: string) => void;
}

export interface Subject {
  _id: number;
  value: string;
}

export interface QuotationInterface {
  _id?: number;
  quoteText: string;
  author: string;
  subjects: string;
  authorLink: string;
  videoLink: string;
  contributedBy: string;
  favorite: boolean;
  deleted: boolean;
}

export interface NotificationsMenuOptionProps {
  notificationsMenuOptionEnum: NotificationsMenuOptionEnum;
  label: string;
  state: any;
  setState?: any;
  toggleFunction?: any;
  bottomLine: boolean;
  errorMessage?: string | null;
}

export interface NavButtonInterface {
  buttonText: string;
  selected: boolean;
  navigationTarget: string;
  navigation: NavigationInterface;
}
