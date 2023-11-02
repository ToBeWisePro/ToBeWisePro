import { type QuotationInterface } from "../res/constants/Interfaces";
import { strings } from "../res/constants/Strings";
import { dbName, defaultUsername } from "../res/constants/Values";
import { shuffle } from "../res/functions/UtilFunctions";
import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_KEYS } from "../res/constants/Enums";
import firestore from "@react-native-firebase/firestore";
import { migrateAndCleanOldData } from "../res/util/BackwardsCompatability";

export async function createDatabaseAndTable(): Promise<void> {
  console.log("createDatabaseAndTable - start");
  const db = SQLite.openDatabase(dbName);

  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS ${dbName} (
             id INTEGER PRIMARY KEY,
             quoteText TEXT,
             author TEXT,
             contributedBy TEXT,
             subjects TEXT,
             authorLink TEXT,
             videoLink TEXT,
             favorite INTEGER,
             deleted INTEGER,
             createdAt TEXT
          )`,
          [],
          () => {
            console.log("createDatabaseAndTable - table created");
            resolve();
          },
          (_, error) => {
            console.error("createDatabaseAndTable - SQL error:", error);
            reject(error);
            return true;
          },
        );
      });
    });
  } catch (error) {
    console.error("createDatabaseAndTable - catch error:", error);
  }
  console.log("createDatabaseAndTable - end");
}

async function getTableColumns(): Promise<string[]> {
  const db = SQLite.openDatabase(dbName);
  const columns: string[] = [];

  return await new Promise<string[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `PRAGMA table_info(${dbName});`,
        [],
        (_, result) => {
          for (let i = 0; i < result.rows.length; i++) {
            columns.push(result.rows.item(i).name);
          }
          resolve(columns);
        },
        (_, error) => {
          console.error(`Error fetching columns:`, error);
          reject(error);
          return true;
        },
      );
    });
  });
}

export async function syncDatabase(): Promise<void> {
  console.log("syncDatabase - start");
  await migrateAndCleanOldData();

  const quotesSnapshot = await firestore().collection("quotes").get();
  console.log("syncDatabase - fetched data from Firestore");
  const quotesArray: QuotationInterface[] = [];
  const valuesToUpdate: string[] = [
    "createdAt",
    "authorLink",
    "videoLink",
    "subjects",
  ];

  // Get the existing columns from the SQLite table
  const existingColumns = await getTableColumns();

  for (const doc of quotesSnapshot.docs) {
    const quoteData = doc.data();

    // Iterate over the keys in the fetched data to ensure the SQLite table has columns for each key
    for (const key in quoteData) {
      if (
        Object.prototype.hasOwnProperty.call(quoteData, key) &&
        !existingColumns.includes(key)
      ) {
        // For simplicity, we're assuming all dynamic fields are TEXT.
        await addColumnIfNotExists(key, "TEXT");

        // Add the new column to the existingColumns array
        existingColumns.push(key);
      }
    }

    const quote: QuotationInterface = {
      ...quoteData,
      favorite: false,
      deleted: false,
    };
    if (Boolean(quoteData.subjects) && Array.isArray(quoteData.subjects)) {
      quote.subjects = cleanUpString(quoteData.subjects.join(", "));
    }
    quotesArray.push(quote);
  }
  console.log("syncDatabase - processed Firestore data");

  // Clean up quotes
  const cleanedQuotes = cleanUpQuotesData(quotesArray);

  for (const quote of cleanedQuotes) {
    const exists = await checkIfQuoteExistsInDatabase(quote);
    if (!exists) {
      await saveQuoteToDatabase(quote);
    } else {
      // Fetch the existing quote from the database
      const existingQuote = await getQuoteFromDatabaseByText(quote.quoteText); // fetching by text

      // Compare the two quotes and check for differences
      for (const key in quote) {
        if (quote[key] !== existingQuote[key]) {
          valuesToUpdate.push(key);
          // Update the database to match the value in Firebase
          await updateQuoteInDatabaseByText(quote.quoteText, key, quote[key]); // updating by text
        }
      }
    }
  }
  console.log("syncDatabase - end");
}

async function getQuoteFromDatabaseByText(
  text: string,
): Promise<QuotationInterface> {
  const db = SQLite.openDatabase(dbName);

  return await new Promise<QuotationInterface>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName} WHERE quoteText = ?;`,
        [text],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0) as QuotationInterface);
          } else {
            reject(new Error("No quote found with the given text"));
          }
        },
        (_, error) => {
          console.error(`Error fetching quote by text:`, error);
          reject(error);
          return true;
        },
      );
    });
  });
}

async function updateQuoteInDatabaseByText(
  text: string,
  key: string,
  value: any,
): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE ${dbName} SET ${key} = ? WHERE quoteText = ?;`,
        [value, text],
        () => {
          resolve();
        },
        (_, error) => {
          console.error(`Error updating quote by text:`, error);
          reject(error);
          return true;
        },
      );
    });
  });
}

export async function initDB(): Promise<void> {
  console.log("initDB - start");

  const db = SQLite.openDatabase(dbName);

  // Step 1: Check if the database or the table exists. If not, create it.
  let tableExists = true;
  try {
    await new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='${dbName}';`,
          [],
          (_, result) => {
            if (result.rows.length === 0) {
              tableExists = false;
            }
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
  } catch (error) {
    console.error("Error checking if table exists:", error);
  }

  if (!tableExists) {
    await createDatabaseAndTable();
  }
  console.log("initDB - about to sync database");

  await syncDatabase();
  console.log("initDB - end");

  // Then log createdAt values
}

export const cleanUpString = (str: unknown) => {
  if (typeof str !== "string") {
    console.warn("Expected a string but received:", str);
    return "";
  }
  return str.replace(/["()]/g, "").trim();
};

export function cleanUpQuotesData(
  quotes: QuotationInterface[],
): QuotationInterface[] {
  // Clean up function for subjects and authors

  const seenQuotes = new Set();

  return quotes
    .map((quote) => {
      // Clean up subject and author
      if (Array.isArray(quote.subjects)) {
        quote.subjects = quote.subjects.map((subject) =>
          cleanUpString(subject),
        );
      }

      if (typeof quote.author === "string") {
        quote.author = cleanUpString(quote.author);
      }

      // Use a combination of quote text and author to check for uniqueness
      const uniqueKey = `${quote.quoteText}-${quote.author}`;

      // Check if the quote is a duplicate
      if (seenQuotes.has(uniqueKey)) {
        return null;
      }
      seenQuotes.add(uniqueKey);
      return quote;
    })
    .filter(Boolean); // Filter out any null values (removed duplicates)
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

  const insertQuery = `INSERT INTO ${dbName} (quoteText, author, contributedBy, subjects, authorLink, videoLink, favorite, deleted, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // Clean up function for subjects and authors
  const cleanUpString = (str: unknown): string => {
    if (typeof str !== "string") {
      console.warn("Expected a string but received:", str);
      return "";
    }
    return str.replace(/["()]/g, "").trim();
  };

  // turn subjects from an array into a comma separated string
  if (Array.isArray(quote.subjects)) {
    quote.subjects = quote.subjects.join(", ");
  }

  // Clean up the subjects and author before saving
  const cleanedSubjects = cleanUpString(quote.subjects);
  const cleanedAuthor = cleanUpString(quote.author);

  await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        [
          quote.quoteText,
          cleanedAuthor,
          quote.contributedBy,
          cleanedSubjects,
          quote.authorLink,
          quote.videoLink,
          quote.favorite ? 1 : 0, // Convert boolean to number
          quote.deleted ? 1 : 0, // Convert boolean to number
          quote.createdAt, // Include the createdAt field
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
  // try {
  const keyPrefix = forNotifications ?? false ? "notification" : "";

  userQuery = await AsyncStorage.getItem(`${keyPrefix}${ASYNC_KEYS.query}`);
  filter = await AsyncStorage.getItem(`${keyPrefix}${ASYNC_KEYS.filter}`);
  if (userQuery !== null && filter !== null) {
    userQuery = userQuery.replaceAll('"', "");
    filter = filter.replaceAll('"', "");
    const db = SQLite.openDatabase(dbName);
    let dbQuery = `SELECT * FROM ${dbName}`;
    let params: any[] = [];

    if (userQuery === strings.customDiscoverHeaders.deleted) {
      dbQuery += " WHERE deleted = 1 ORDER BY RANDOM()";
    } else if (userQuery === strings.customDiscoverHeaders.all) {
      dbQuery += " WHERE deleted = 0 ORDER BY RANDOM()";
    } else if (userQuery === strings.customDiscoverHeaders.recent) {
      dbQuery +=
        " WHERE deleted = 0 AND createdAt IS NOT NULL ORDER BY createdAt DESC";
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
        console.log("Executing SQLite query:", dbQuery, "with params:", params);

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
  } else {
    console.log("From getShuffledQuotes: ", userQuery, filter);
    throw new Error("Invalid userQuery or filter");
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
    case strings.customDiscoverHeaders.recent:
      query = `SELECT COUNT(*) AS count FROM ${dbName} WHERE deleted = 0 AND createdAt IS NOT NULL`;
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

export async function checkIfQuoteExistsInDatabase(
  quote: QuotationInterface,
): Promise<boolean> {
  const db = SQLite.openDatabase(dbName);

  const trimmedQuoteText = quote.quoteText.trim();
  const trimmedAuthor = quote.author.trim();

  return await new Promise<boolean>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT COUNT(*) as count FROM ${dbName} WHERE quoteText = ? AND author = ?`,
        [trimmedQuoteText, trimmedAuthor],
        (_, result) => {
          if (result.rows.item(0).count > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        (_, error) => {
          console.error(
            `Error in checkIfQuoteExistsInDatabase: ${JSON.stringify(error)}`,
          );
          reject(error);
          return true; // abort the transaction
        },
      );
    });
  });
}
export async function debugLogQuotes(): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  const query = `SELECT quoteText, createdAt FROM ${dbName}`;

  db.transaction((tx) => {
    tx.executeSql(
      query,
      [],
      (_, result) => {
        const rows = result.rows;
        for (let i = 0; i < rows.length; i++) {
          const quote = rows.item(i);
          console.log("Quote:", quote.quoteText);
          console.log("CreatedAt:", quote.createdAt);
        }
      },
      (_, error) => {
        console.error("Error fetching quotes for debugging:", error);
        return true;
      },
    );
  });
}

// Helper to add new columns if they don't exist
async function addColumnIfNotExists(
  columnName: string,
  dataType: string,
): Promise<void> {
  const db = SQLite.openDatabase(dbName);

  const alterTableSQL = `ALTER TABLE ${dbName} ADD COLUMN ${columnName} ${dataType};`;

  await new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        alterTableSQL,
        [],
        () => {
          resolve();
        },
        (_, error) => {
          console.error(`Error adding column ${columnName}:`, error);
          reject(error);
          return true;
        },
      );
    });
  });
}
