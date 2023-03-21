import { jsonQuotes } from "../../../data/jsonQuotes";
import { QuotationSchema } from "../constants/DataModels";
import { QuotationInterface } from "../constants/Interfaces";
import { strings } from "../constants/Strings";
import { dbName, defaultUsername } from "../constants/Values";
import { shuffle } from "./UtilFunctions";
import * as SQLite from "expo-sqlite";

export async function dataImporter() {
  const db = SQLite.openDatabase(dbName);
  /*
1. Check if our database exists. If not, create it
2. Import our data into the database
3. Make sure the import worked. If not, log an error 
*/

  // Check if our database exists. If not, create it
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ${dbName} ( _id INTEGER PRIMARY KEY AUTOINCREMENT, quoteText TEXT, author TEXT, contributedBy TEXT, subjects TEXT, authorLink TEXT, videoLink TEXT, favorite INTEGER);`
    );
  });

  // import jsonQuotes into our database if our database is empty

  const isDbEmpty: boolean = await new Promise<boolean>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName}`,
        [],
        (_, result) => {
          resolve(result.rows.length === 0);
        },
        (_, error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  });

  if (isDbEmpty) {
    // isDbEmpty will be true if our database is empty
    const quotes: QuotationInterface[] = jsonQuotes.map((quote) => {
      return {
        _id: quote._id,
        quoteText: quote.quoteText,
        author: quote.author,
        contributedBy: quote.contributedBy,
        subjects: quote.subjects,
        authorLink: quote.authorLink,
        videoLink: quote.videoLink,
        favorite: quote.favorite,
      };
    });

    const insertQuery = `INSERT INTO ${dbName} (quoteText, author, contributedBy, subjects, authorLink, videoLink, favorite) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.transaction((tx) => {
      quotes.forEach((quote) => {
        tx.executeSql(insertQuery, [
          quote.quoteText,
          quote.author,
          quote.contributedBy,
          quote.subjects,
          quote.authorLink,
          quote.videoLink,
          quote.favorite,
        ]);
      });
    });
  }

  // print the length of our database to make sure it's the same length as our jsonQuotes array without using a promise
  db.transaction((tx) => {
    tx.executeSql(`SELECT * FROM ${dbName}`, []);
  });
}

export async function getShuffledQuotes(
  key: string,
  filter: string
): Promise<QuotationInterface[]> {
  const db = SQLite.openDatabase(dbName);

  let query = `SELECT * FROM ${dbName}`;
  if (filter === strings.filters.author) {
    query += ` WHERE author LIKE '%${key}%' ORDER BY RANDOM()`;
  } else if (filter === strings.filters.subject) {
    query += ` WHERE subjects LIKE '%${key}%' ORDER BY RANDOM()`;
  } else {
    throw new Error("Invalid filter provided");
  }

  return new Promise<QuotationInterface[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        [],
        (_, result) => {
          const quotes: QuotationInterface[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            quotes.push(result.rows.item(i));
          }
          resolve(quotes);
        },
        (_, error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  });
}

export async function getFromDB(key: string): Promise<string[]> {
  const db = SQLite.openDatabase(dbName);
  switch (key) {
    case strings.filters.author:
      key = "author";
      break;
    case strings.filters.subject:
      key = "subjects";
      break;
    default:
      throw new Error("Invalid filter provided");
  }
  const query = `SELECT DISTINCT "${key}" FROM ${dbName} ORDER BY "${key}" ASC`;

  return new Promise<string[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        [],
        (_, result) => {
          const values = [];
          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            const value = row[key];
            if (value) {
              values.push(value);
            }
          }
          resolve(values.sort());
        },
        (_, error) => {
          console.log(error);
          reject(error);
        }
      );
    });
  });
}

export const getQuoteByID = async (
  _id: number
): Promise<QuotationInterface | undefined> => {
  try {
    const db = await SQLite.openDatabase(dbName);
    // @ts-ignore
    const [result] = await db.executeSql(
      `SELECT * FROM ${dbName} WHERE _id = ?`,
      [_id]
    );

    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      return {
        _id: row._id,
        quoteText: row.quoteText,
        author: row.author,
        contributedBy: row.contributedBy,
        subjects: row.subjects,
        authorLink: row.authorLink,
        videoLink: row.videoLink,
        favorite: row.favorite,
      };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const addQuote = async (quotation: QuotationInterface) => {
  const db = SQLite.openDatabase("myrealm");

  await new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO ${dbName} 
            (_id, quoteText, author, contributedBy, subjects, authorLink, videoLink, favorite)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotation._id,
          quotation.quoteText,
          quotation.author,
          quotation.contributedBy,
          quotation.subjects,
          quotation.authorLink,
          quotation.videoLink,
          0,
        ],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
        }
      );
    });
  });
};

export const editQuote = async (quotation: QuotationInterface) => {
  // Edit a quote to match the quote passed in
  const realm = await Realm.open({
    path: "myrealm",
    schema: [QuotationSchema],
  });
  await realm.write(async () => {
    const updt: QuotationInterface = realm.objectForPrimaryKey(
      dbName,
      quotation._id
    );
    updt.quoteText = quotation.quoteText;
    updt.author = quotation.author;
    updt.videoLink = quotation.videoLink;
    updt.authorLink = quotation.authorLink;
    updt.subjects = quotation.subjects;
    // updt.contributedBy = quotation.contributedBy
  });
};

export const getAllQuotes = async (): Promise<QuotationInterface[]> => {
  const db = await SQLite.openDatabase(dbName);

  return new Promise<QuotationInterface[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName};`,
        [],
        (_, { rows }) => {
          const objs: QuotationInterface[] = rows["_array"];
          resolve(shuffle(objs));
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getQuotesContributedByMe = async (): Promise<
  QuotationInterface[]
> => {
  const db = await SQLite.openDatabase(dbName);

  return new Promise<QuotationInterface[]>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM quotations WHERE contributedBy = ?;`,
        [defaultUsername],
        (_, { rows }) => {
          const objs: QuotationInterface[] = rows["_array"];
          resolve(shuffle(objs));
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getFavoriteQuotes = async (): Promise<QuotationInterface[]> => {
  const db = SQLite.openDatabase(dbName);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${dbName} WHERE favorite = 1`,
        [],
        (_, { rows }) => {
          const objs: QuotationInterface[] = rows["_array"];
          resolve(shuffle(objs));
        },
        (_, error) => {
          reject(error);
        }
      );
    });
    c;
  });
};

export const getQuoteCount = async (query: string, filter: string) => {
  const db = SQLite.openDatabase(dbName);

  return new Promise<number>((resolve, reject) => {
    db.transaction((tx) => {
      let sql = "";
      let params: (string | number | null)[] | undefined = [];

      switch (query) {
        case strings.customDiscoverHeaders.all:
          sql = "SELECT COUNT(*) FROM Quotation";
          break;
        case strings.customDiscoverHeaders.addedByMe:
          sql = "SELECT COUNT(*) FROM Quotation WHERE addedByMe = 1";
          break;
        case strings.customDiscoverHeaders.favorites:
          sql = "SELECT COUNT(*) FROM Quotation WHERE isFavorite = 1";
          break;
        case strings.customDiscoverHeaders.top100:
          sql =
            "SELECT COUNT(*) FROM Quotation WHERE version = ? AND subjects LIKE ? ORDER BY RANDOM() LIMIT 100";
          params = [dbName, `%${strings.filters.subject}%`];
          break;
        default:
          const safeQuery = query.replaceAll("'", strings.database.safeChar);

          if (filter === strings.filters.author) {
            sql =
              "SELECT COUNT(*) FROM Quotation WHERE version = ? AND author = ?";
            params = [dbName, safeQuery];
          } else if (filter === strings.filters.subject) {
            sql =
              "SELECT COUNT(*) FROM Quotation WHERE version = ? AND subjects LIKE ?";
            params = [dbName, `%${safeQuery}%`];
          } else {
            reject(new Error("Invalid query and filter"));
            return;
          }
          break;
      }

      tx.executeSql(
        sql,
        params,
        (txObj, { rows }) => {
          const count = rows.item(0)["COUNT(*)"];
          resolve(count);
        },
        (txObj, error) => {
          reject(error);
        }
      );
    });
  });
};

export const updateQuoteContainer = (
  quote: QuotationInterface,
  refreshRate: number,
  setQuote: (x: QuotationInterface) => void
) => {
  setInterval(async () => {
    try {
      // every 1/10 of a second, get the selected quote and make sure that the info that we're displaying to the user is correct. This makes sure that edits are displayed
      const mostUpToDateQuote: QuotationInterface = await getQuoteByID(
        quote._id
      );
      setQuote(mostUpToDateQuote);
    } catch {
      console.log("Error: couldn't update quote");
    }
  }, refreshRate);
};
