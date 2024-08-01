import AsyncStorage from "@react-native-async-storage/async-storage";
import { isNumber } from "lodash";
import { dbName } from "../constants/Values";
import * as SQLite from "expo-sqlite";
import { cleanUpString } from "../../backend/DBFunctions";

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

export async function migrateAndCleanOldData(): Promise<void> {
  const db = SQLite.openDatabase(dbName);
  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName}`,
        [],
        (_, result) => {
          for (let i = 0; i < result.rows.length; i++) {
            const item = result.rows.item(i);
            const cleanedSubjects = cleanUpString(item.subjects);
            // Update the cleaned data back into the database
            tx.executeSql(`UPDATE ${dbName} SET subjects = ? WHERE _id = ?`, [
              cleanedSubjects,
              item._id,
            ]);
          }
          resolve();
        },
        (_, error) => {
          console.error(`Error fetching rows:`, error);
          reject(error);
          return true;
        },
      );
    });
  });
}
