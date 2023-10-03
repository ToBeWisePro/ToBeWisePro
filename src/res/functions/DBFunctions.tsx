import { jsonQuotes } from "../../../data/jsonQuotes";
import { type QuotationInterface } from "../constants/Interfaces";
import { strings } from "../constants/Strings";
import { dbName, defaultUsername } from "../constants/Values";
import { shuffle } from "./UtilFunctions";
import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../constants/Enums";
import { Alert } from "react-native";

export async function dataImporter(): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  // Use try-catch to handle errors
  try {
    // Use const for functions that do not change
    const createTable = new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${dbName} ( _id INTEGER PRIMARY KEY AUTOINCREMENT, quoteText TEXT, author TEXT, contributedBy TEXT, subjects TEXT, authorLink TEXT, videoLink TEXT, favorite BOOLEAN, deleted BOOLEAN);`,
          [],
          () => {
            resolve();
          },
          (_, error) => {
            console.error(error);
            reject(error);
            return true;
          },
        );
      });
    });

    await createTable;

    const isDbEmpty = await new Promise<boolean>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${dbName}`,
          [],
          (_, result) => {
            resolve(result.rows.length === 0);
          },
          (_, error) => {
            console.error(error);
            reject(error);
            return true;
          },
        );
      });
    });

    if (isDbEmpty) {
      const quotes: QuotationInterface[] = jsonQuotes.map((quote) => ({
        ...quote,
        favorite: false,
        deleted: false,
      }));

      for (const quote of quotes) {
        await saveQuoteToDatabase(quote);
      }
    }
  } catch (error) {
    console.error("Error in dataImporter:", error);
  }
}

export async function editQuote(
  quoteId: number,
  newQuote: QuotationInterface,
): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE ${dbName} SET quoteText = ?, author = ?, contributedBy = ?, subjects = ?, authorLink = ?, videoLink = ?, favorite = ?, deleted = ? WHERE _id = ?`,
        [
          newQuote.quoteText,
          newQuote.author,
          newQuote.contributedBy,
          newQuote.subjects,
          newQuote.authorLink,
          newQuote.videoLink,
          newQuote.favorite ? 1 : 0,
          newQuote.deleted ? 1 : 0,
          quoteId,
        ],
        () => {
          resolve();
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true;
        },
      );
    });
  });
}

export async function saveQuoteToDatabase(
  quote: QuotationInterface,
): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  const insertQuery = `INSERT INTO ${dbName} (quoteText, author, contributedBy, subjects, authorLink, videoLink, favorite, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  // console.log("Attempting to save quote:", quote);
  // console.log("Using insert query:", insertQuery);

  await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        [
          quote.quoteText,
          quote.author,
          quote.contributedBy,
          quote.subjects,
          quote.authorLink,
          quote.videoLink,
          quote.favorite ? 1 : 0, // Convert boolean to number
          quote.deleted ? 1 : 0, // Convert boolean to number
        ],
        (_, resultSet) => {
          resolve(resultSet.insertId);
        },
        (_, error) => {
          console.log("Error when saving quote:", error);
          console.log("Failed to save quote:", quote);
          console.log("Used insert query:", insertQuery);
          reject(error);
          return true;
        },
      );
    });
  });
}

export async function removeQuote(quoteId: number): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `DELETE FROM ${dbName} WHERE _id = ?`,
        [quoteId],
        () => {
          resolve();
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true;
        },
      );
    });
  });
}

export async function getShuffledQuotes(
  forNotifications?: boolean,
): Promise<QuotationInterface[]> {
  let userQuery, filter;
  try {
    const keyPrefix = forNotifications ?? false ? "notification" : "";

    userQuery = await AsyncStorage.getItem(`${keyPrefix}${ASYNC_KEYS.query}`);
    filter = await AsyncStorage.getItem(`${keyPrefix}${ASYNC_KEYS.filter}`);

    if (userQuery != null) userQuery = userQuery.replaceAll('"', "");
    if (filter != null) filter = filter.replaceAll('"', "");
    if (forNotifications ?? false) {
      // TODO I can't for the life of me figure out why these sometimes get wrapped in quotation marks
      await AsyncStorage.getItem(ASYNC_KEYS.notificationQuery).then(
        (res) => (userQuery = res?.replaceAll('"', "")),
      );
      await AsyncStorage.getItem(ASYNC_KEYS.notificationFilter).then(
        (res) => (filter = res?.replaceAll('"', "")),
      );
    } else {
      await AsyncStorage.getItem(ASYNC_KEYS.query).then(
        (res) => (userQuery = res?.replaceAll('"', "")),
      );
      await AsyncStorage.getItem(ASYNC_KEYS.filter).then(
        (res) => (filter = res?.replaceAll('"', "")),
      );
    }
    const db = SQLite.openDatabase(dbName);
    let dbQuery = `SELECT * FROM ${dbName}`;
    let params: any[] = [];

    if (userQuery == null || filter == null)
      throw new Error("Invalid userQuery or filter");

    if (userQuery === strings.customDiscoverHeaders.deleted) {
      dbQuery += " WHERE deleted = 1 ORDER BY RANDOM()";
    } else if (userQuery === strings.customDiscoverHeaders.all) {
      dbQuery += " WHERE deleted = 0 ORDER BY RANDOM()";
    } else if (userQuery === strings.customDiscoverHeaders.top100) {
      dbQuery += " WHERE subjects LIKE ? AND deleted = 0 ORDER BY RANDOM()";
      params = [`%${"Top 100"}%`];
    } else if (userQuery === "Top 100") {
      dbQuery += " WHERE subjects LIKE ? AND deleted = 0 ORDER BY RANDOM()";
      params = [`%${"Top 100"}%`];
    } else if (userQuery === strings.customDiscoverHeaders.favorites) {
      dbQuery += " WHERE favorite = 1 AND deleted = 0 ORDER BY RANDOM()";
    } else if (userQuery === strings.customDiscoverHeaders.all) {
      dbQuery += " AND deleted = 1";
    } else if (userQuery === strings.customDiscoverHeaders.addedByMe) {
      dbQuery += " WHERE contributedBy = ? AND deleted = 0 ORDER BY RANDOM()";
      params = [defaultUsername]; // ensure the correct username is used here
    } else if (filter === strings.filters.author) {
      dbQuery += ` WHERE deleted = 0 AND author LIKE '%${userQuery}%' ORDER BY RANDOM()`;
    } else if (filter === strings.filters.subject) {
      dbQuery +=
        " WHERE deleted = 0 AND (subjects LIKE ? OR subjects LIKE ? OR subjects LIKE ?) ORDER BY RANDOM()";
      params = [
        `%${userQuery.trim()}%`,
        `%${userQuery.trim()},%`,
        `%,${userQuery.trim()}%`,
      ];
    } else {
      const string = `Invalid filter provided: ${filter}`;
      throw new Error(string);
    }
    return await new Promise<QuotationInterface[]>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          dbQuery,
          params,
          (_, result) => {
            const quotes: QuotationInterface[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              quotes.push(result.rows.item(i));
            }
            resolve(quotes);
          },
          (_, error) => {
            console.error(error);
            reject(error);
            return true;
          },
        );
      });
    });
  } catch (error) {
    // make error into a string
    Alert.alert(
      "An error quote has been generated by the system. If you see it, please share it with Griffin Clark at 760-889-3464",
    );
    // @ts-expect-error error is a string
    const strError = error.toString();
    return [
      {
        quoteText:
          strError + "\n userQuery: " + userQuery + "\n filter: " + filter,
        subjects: "Error",
        author: "Error",
        contributedBy: "Error",
        authorLink: "Error",
        videoLink: "Error",
        favorite: false,
        deleted: false,
      },
    ];
  }
}

export async function getFromDB(key: string): Promise<string[]> {
  const db = SQLite.openDatabase(dbName);
  let dbKey: string;

  switch (key) {
    case strings.filters.author:
      dbKey = "author";
      break;
    case strings.filters.subject:
      dbKey = "subjects";
      break;
    default:
      throw new Error("Invalid filter provided");
  }

  const query = `SELECT DISTINCT ${dbKey} FROM ${dbName} ORDER BY ${dbKey} ASC`;

  return await new Promise<string[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        [],
        (_, result) => {
          const values: string[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            const value = row[dbKey];
            if (typeof value === "string") {
              values.push(value);
            }
          }
          resolve(values.sort());
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true; // abort the transaction
        },
      );
    });
  });
}

export async function getQuoteById(
  id: number,
): Promise<QuotationInterface | null> {
  const db = SQLite.openDatabase(dbName);

  return await new Promise<QuotationInterface | null>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName} WHERE _id = ?`,
        [id],
        (_, result) => {
          if (result.rows.length === 0) {
            console.log(`No quote found with id: ${id}`); // Debugging line
            resolve(null);
          } else {
            const quote: QuotationInterface = result.rows.item(0);
            // console.log(`Fetched quote: ${JSON.stringify(quote)}`); // Debugging line
            resolve(quote);
          }
        },
        (_, error) => {
          console.error(`Error in getQuoteById: ${JSON.stringify(error)}`); // Properly log the error object
          reject(error);
          return true; // abort the transaction
        },
      );
    });
  });
}

export const getQuotesContributedByMe = async (): Promise<
  QuotationInterface[]
> => {
  const db = SQLite.openDatabase(dbName);

  return await new Promise<QuotationInterface[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName} WHERE contributedBy = ? AND deleted = 0 ORDER BY RANDOM();`,
        [defaultUsername],
        (_, { rows }) => {
          const objs: QuotationInterface[] = rows._array;
          resolve(shuffle(objs));
        },
        (_, error) => {
          reject(error);
          return true; // abort the transaction
        },
      );
    });
  });
};

export async function getQuoteCount(
  key: string,
  filter: string,
): Promise<number> {
  const db = SQLite.openDatabase(dbName);

  let query = "";
  let params: any[] = [];

  switch (filter) {
    case strings.filters.author:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE author = ? AND deleted = 0`;
      params = [key];
      break;
    case strings.filters.subject:
      query += `SELECT COUNT(*) AS count FROM ${dbName} WHERE deleted = 0 AND (subjects LIKE ? OR subjects LIKE ? OR subjects LIKE ?) ORDER BY RANDOM()`;
      params = [`%${key.trim()}%`, `%${key.trim()},%`, `%,${key.trim()}%`];
      break;
    case strings.customDiscoverHeaders.all:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE deleted = 0`;
      break;
    case strings.customDiscoverHeaders.addedByMe:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE contributedBy = ? AND deleted = 0`;
      params = [defaultUsername]; // ensure the correct username is used here
      break;
    case strings.customDiscoverHeaders.favorites:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE favorite = 1 AND deleted = 0`;
      break;
    case strings.customDiscoverHeaders.top100:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE subjects LIKE ? AND deleted = 0`;
      params = [`%${"Top 100"}%`];
      break;
    case "Top 100":
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE subjects LIKE ? AND deleted = 0`;
      params = [`%${"Top 100"}%`];
      break;
    case strings.customDiscoverHeaders.deleted:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE deleted = 1`;
      break;
    default:
      break;
  }

  return await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => {
          resolve(result.rows.item(0).count);
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true;
        },
      );
    });
  });
}

export const updateQuote = async (
  updatedQuote: QuotationInterface,
): Promise<boolean> => {
  const db = SQLite.openDatabase(dbName);

  if (updatedQuote._id === undefined) {
    console.error("Error: updatedQuote._id is undefined");
    return await Promise.resolve(false); // Resolve the promise with false
  }

  return await new Promise<boolean>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE ${dbName} SET favorite = ? WHERE _id = ?`,
        // @ts-expect-error undefined is not a number
        [updatedQuote.favorite ? 1 : 0, updatedQuote._id], // Now updatedQuote._id is guaranteed to be a number
        (_, { rowsAffected }) => {
          if (rowsAffected > 0) {
            resolve(true);
          } else {
            console.error("Error updating quote");
            resolve(false); // Resolve with false if no rows were affected
          }
        },
        (_, error) => {
          console.error(error);
          resolve(false); // Resolve with false in case of an error
          return true;
        },
      );
    });
  });
};

export async function markQuoteAsDeleted(
  quote: QuotationInterface,
  shouldDelete: boolean,
): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  if (quote._id === undefined) {
    await Promise.reject(new Error("Error: quote._id is undefined"));
    return; // Reject the promise with an error message
  }

  const query = `UPDATE ${dbName} SET deleted = ? WHERE _id = ?`;
  const params = [shouldDelete ? 1 : 0, quote._id]; // Now quote._id is guaranteed to be a number

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        () => {
          resolve();
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true; // abort the transaction
        },
      );
    });
  });
}
