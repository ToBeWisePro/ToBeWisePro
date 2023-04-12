import {Dimensions} from "react-native";
import { globalStyles } from "../../../styles/GlobalStyles";

export const dbName: string = "QuotesDB"
export const largeQuoteContainerRefreshRate = 5000
export const autoScrollIntervalTime = 2000
export const maxScrollIntervalTime = 5000
export const defaultUsername = "DefaultUser"
export const maxWindowSize = Dimensions.get("window").height - ((globalStyles.navbar.height + globalStyles.navbar.playPauseHeight) - globalStyles.navbar.topHeight)