import { jsonQuotes } from "../../../data/jsonQuotes";
import { QuotationSchema } from "../constants/DataModels";
import { QuotationInterface } from "../constants/Interfaces";
import { strings } from "../constants/Strings";
import { currentQuotationVersion } from "../constants/Values";
import { shuffle } from "./UtilFunctions";
export async function dataImporter() {
    // imports all data from jsonQuotes and adds it to Realm DB if this is the first time the app is run
    let realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });

    const quotesDB = realm.objects(currentQuotationVersion);
    if (quotesDB.length == 0) {
        let i = 0;
        jsonQuotes.map((quote: QuotationInterface) => {
            quote.author = quote.author.replace("'", strings.database.safeChar);

            realm.write(() => {
                realm.create(currentQuotationVersion, {
                    _id: i,
                    quoteText: quote.quoteText,
                    author: quote.author,
                    contributedBy: quote.contributedBy,
                    subjects: quote.subjects,
                    authorLink: quote.authorLink,
                    videoLink: quote.videoLink,
                    favorite: 0,
                });
                i++;
            });
        });
        console.log(`DB built. New DB length: ${quotesDB.length}`);
    }
}

export async function getShuffledQuotes(key: string, filter: string) {
    // given a key (search term) and filter (are we searching authors or subjects?), return a shuffled list of quotes from Realm that matches those search terms

    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const safeKey = key.replaceAll("'", strings.database.safeChar)

    const shuffledQuotes: QuotationInterface[] = [];
    let unshuffledQuotes: QuotationInterface[];
    switch (filter) {
        case strings.filters.author:
            unshuffledQuotes = realm
                .objects(currentQuotationVersion)
                .filtered("author == '" + safeKey + "'");
            break;
        case strings.filters.subject:
            unshuffledQuotes = realm
                .objects(currentQuotationVersion)
                .filtered("subjects contains '" + safeKey + "'");
            break;
    }

    return shuffle(unshuffledQuotes)
}

export const getSubjects = async () => {
    // get all subjects being used in our quotes database. If the subject has a space in [0], remove it
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const quotesDB = realm.objects(currentQuotationVersion);
    const subjects: string[] = [];
    quotesDB.forEach((quote: QuotationInterface) => {
        const quoteSubjects: string[] = quote.subjects.split(",");
        quoteSubjects.forEach((quoteSubject) => {
            if (!subjects.includes(quoteSubject.trim())) {
                subjects.push(quoteSubject.trim());
            }
        });
    });
    const sortedSubjects = subjects.sort(function (a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });
    return [...new Set(sortedSubjects)];
};

export const getAuthors = async () => {
    // Get all authors being used in our database
    // TODO merge getSubjects and getAuthors
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const quotesDB = realm.objects(currentQuotationVersion);
    const authors: string[] = [];
    quotesDB.forEach((quote: QuotationInterface) => {
        if (!authors.includes(quote.author)) {
            authors.push(quote.author);
        }
    });
    let cleanAuthors: string[] = []
    authors.forEach((author) => {
        cleanAuthors.push(author.replaceAll(strings.database.safeChar, "'"))
    })
    const sortedAuthors = cleanAuthors.sort(function (a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });

    return [...new Set(sortedAuthors)];
};

export const getQuoteByID = async (_id: number) => {
    // given a quote ID, return the database reference for that quote
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const quote: QuotationInterface = realm.objectForPrimaryKey(currentQuotationVersion, _id)
    return quote
};

export const addQuote = async (quotation: QuotationInterface) => {
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    await realm.write(() => {
        realm.create(currentQuotationVersion, {
            _id: quotation._id,
            quoteText: quotation.quoteText,
            author: quotation.author,
            contributedBy: quotation.contributedBy,
            subjects: quotation.subjects,
            authorLink: quotation.authorLink,
            videoLink: quotation.videoLink,
            favorite: 0,
        });
    })
}

export const editQuote = async (quotation: QuotationInterface) => {
    // Edit a quote to match the quote passed in
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    await realm.write(async () => {
        const updt: QuotationInterface = realm.objectForPrimaryKey(currentQuotationVersion, quotation._id)
        updt.quoteText = quotation.quoteText
        updt.author = quotation.author
        updt.videoLink = quotation.videoLink
        updt.authorLink = quotation.authorLink
        updt.subjects = quotation.subjects
        // updt.contributedBy = quotation.contributedBy

    })
}

export const deleteQuote = async (quote: QuotationInterface) => {
    // Delete a quote
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    await realm.write(() => {
        realm.delete(realm.objectForPrimaryKey(currentQuotationVersion, quote._id))
    })
}

export const getAllQuotes = async ()=>{
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const objs: QuotationInterface[] = await realm.objects(currentQuotationVersion)
    return shuffle(objs)

}

export const getQuotesContributedByMe = async ()=> {
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const objs: QuotationInterface[] = await realm.objects(currentQuotationVersion).filtered("contributedBy == '" + defaultUsername + "'");
    return shuffle(objs)
}

export const getFavoriteQuotes = async ()=> {
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    const objs: QuotationInterface[] = await realm.objects(currentQuotationVersion).filtered("favorite == 1");
    return shuffle(objs)
}

export const getQuoteCount = async (query: string, filter: string)=> {
    const realm = await Realm.open({
        path: "myrealm",
        schema: [QuotationSchema],
    });
    let x = 0
    switch(query){
        
        case strings.customDiscoverHeaders.all:
          await getAllQuotes().then((res: QuotationInterface[]) => {
            // console.log("All length: ", res.length)
            x= res.length})
          break;
        case strings.customDiscoverHeaders.addedByMe:
          await getQuotesContributedByMe().then((res: QuotationInterface[])=> {
            // console.log("Contributed by me length: ", res.length)

            x= res.length})
          break;
        // case strings.customDiscoverHeaders.deleted:
        case strings.customDiscoverHeaders.favorites:

          await getFavoriteQuotes().then((res: QuotationInterface[])=> {
            // console.log("Favorites length: ", res.length)

            x= res.length})
          break;
        case strings.customDiscoverHeaders.top100:
          await getShuffledQuotes('Top 100', strings.filters.subject).then((res: QuotationInterface[])=> {
            // console.log("Top 100 length: ", res.length)

            x= res.length})
          break;
        default:
            const safeQuery = query.replaceAll("'", strings.database.safeChar);

            if(filter == strings.filters.author) {
                x= await realm.objects(currentQuotationVersion).filtered("author == '" + safeQuery + "'").length
            } else if (filter == strings.filters.subject) {
                x= await realm.objects(currentQuotationVersion).filtered("subjects contains '" + safeQuery + "'").length;
            }    else x= -1
          break;
      }     
      return x
    
}

export const updateQuoteContainer = (quote: QuotationInterface, refreshRate: number, setQuote: (x: Quotation)=> void)=>{
    setInterval(async () => {
        try {
          // every 1/10 of a second, get the selected quote and make sure that the info that we're displaying to the user is correct. This makes sure that edits are displayed
          const mostUpToDateQuote: QuotationInterface = await getQuoteByID(quote._id)
          setQuote(mostUpToDateQuote)
        } catch {
          console.log("Error: couldn't update quote")
        }
      }, refreshRate)
}