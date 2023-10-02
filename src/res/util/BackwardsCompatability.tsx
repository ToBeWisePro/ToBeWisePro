import AsyncStorage from "@react-native-async-storage/async-storage";
import { isNumber } from "lodash";

export const convertDateTo24h = async (
  key: string,
  defaultValue: number,
): Promise<void> => {
  try {
    const storedValue = await AsyncStorage.getItem(key);
    if (storedValue !== null) {
      const value = JSON.parse(storedValue);
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (!isNumber(value)) {
        const date = new Date(value);
        const convertedValue = date.getHours() * 100 + date.getMinutes();
        await AsyncStorage.setItem(key, JSON.stringify(convertedValue));
      }
    } else {
      await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
    }
  } catch (error) {
    console.error("Error converting date to 24h format:", error);
  }
};
