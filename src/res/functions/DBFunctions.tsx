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
db.transaction(tx => {
  tx.executeSql(`CREATE TABLE IF NOT EXISTS ${dbName} ( _id INTEGER PRIMARY KEY AUTOINCREMENT, quoteText TEXT, author TEXT, contributedBy TEXT, subjects TEXT, authorLink TEXT, videoLink TEXT, favorite INTEGER);`)
})

  // import jsonQuotes into our database
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

  // print the length of our database to make sure it's the same length as our jsonQuotes array without using a promise
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM ${dbName}`,
      [],
      (_, result) => console.log(result.rows.length),
      (_, error) => console.log(error)
    );
  }
  );
}

export async function getShuffledQuotes(
  key: string,
  filter: string
): Promise<QuotationInterface[]> {
  // given a key (search term) and filter (are we searching authors or subjects?), return a shuffled list of quotes from SQLite that matches those search terms

  // const db = SQLite.openDatabase(dbName);
  // const safeKey = key.replaceAll("'", strings.database.safeChar);

  // let query: string, params: any[];
  // switch (filter) {
  //   case strings.filters.author:
  //     query = `SELECT * FROM ${dbName} WHERE author = ?`;
  //     params = [safeKey];
  //     break;
  //   case strings.filters.subject:
  //     query = `SELECT * FROM ${dbName} WHERE subjects LIKE '%' || ? || '%'`;
  //     params = [safeKey];
  //     break;
  //   default:
  //     throw new Error(`Invalid filter: ${filter}`);
  // }

  // const [result] = await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       query,
  //       params,
  //       (_, result) => resolve(result),
  //       (_, error) => reject(error)
  //     );
  //   });
  // });

  // const unshuffledQuotes: QuotationInterface[] = Array.from(result.rows).map(
  //   (row) => {
  //     return {
  //       _id: row._id,
  //       quoteText: row.quoteText,
  //       author: row.author,
  //       contributedBy: row.contributedBy,
  //       subjects: row.subjects,
  //       authorLink: row.authorLink,
  //       videoLink: row.videoLink,
  //       favorite: row.favorite,
  //     };
  //   }
  // );

  // return shuffle(unshuffledQuotes);
  console.log("shuffled quotes");
}

export const getSubjects = async (): Promise<string[]> => {
  // get all subjects being used in our quotes database. If the subject has a space in [0], remove it
  const db = await SQLite.openDatabase(dbName);

  const [result] = await new Promise<SQLite.SQLResultSet>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT subjects FROM ${dbName}`,
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });

  const subjects: string[] = Array.from(result.rows).reduce<string[]>(
    (acc, row) => {
      const quoteSubjects = row.subjects
        .split(",")
        .map((subject) => subject.trim());
      return [...new Set([...acc, ...quoteSubjects])];
    },
    []
  );

  const sortedSubjects = subjects.sort((a, b) => a.localeCompare(b));

  return sortedSubjects;
};

export const getAuthors = async (): Promise<string[]> => {
  try {
    const db = await SQLite.openDatabase(dbName);
    const [result] = await db.executeSql(
      `SELECT DISTINCT REPLACE(author, "${strings.database.safeChar}", "'") as author FROM ${dbName} ORDER BY author ASC`
    );

    const authors: string[] = result.rows
      .raw()
      .map((row: { author: any }) => row.author);

    return authors;
  } catch (error) {
    console.error(error);
    return [];
  }
};

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

// export const deleteQuote = async (quote: QuotationInterface) => {
//     // Delete a quote
//     const realm = await Realm.open({
//         path: "myrealm",
//         schema: [QuotationSchema],
//     });
//     await realm.write(() => {
//         realm.delete(realm.objectForPrimaryKey(currentQuotationVersion, quote._id))
//     })
// }

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
