import { BackButtonNavEnum, NotificationsMenuOptionEnum } from "./Enums";

export interface RouteInterface {
    params: {
      currentQuotes: QuotationInterface[];
      editingQuote: QuotationInterface;
      quoteSearch: {
        filter: string;
        query: string;
      };
      showBackButton: boolean;
      backButtonNavigationFunction: BackButtonNavEnum;
    };
  }
  
  export interface NavigationInterface {
    push: (ev: string, {}) => void;
    goBack: () => void;
  }

  export interface Subject {
    _id: number;
    value: string;
  }

  export interface QuotationInterface {
    _id: number,
    quoteText: string,
    author: string,
    subjects: string,
    authorLink: string,
    videoLink: string,
    contributedBy?: string,
    favorite: number
};

export interface NotificationsMenuOptionProps {
  notificationsMenuOptionEnum: NotificationsMenuOptionEnum;
  label: string;
  state: any;
  setState?: (x: any) => void;
  toggleFunction?: () => void;
  bottomLine: boolean;
}

export interface NavButtonInterface {
  buttonText: string;
  selected: boolean;
  navigationTarget: string;
  navigation: NavigationInterface;
}