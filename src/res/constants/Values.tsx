import {Dimensions} from "react-native";
import { globalStyles } from "../../../styles/GlobalStyles";

export const currentQuotationVersion: string = "QuotationV4"
export const largeQuoteContainerRefreshRate = 5000
export const autoScrollIntervalTime = 4500
export const maxScrollIntervalTime = 10000
export const defaultUsername = "DefaultUser"
export const maxWindowSize = Dimensions.get("window").height - ((globalStyles.navbar.height + globalStyles.navbar.playPauseHeight) - globalStyles.navbar.topHeight)