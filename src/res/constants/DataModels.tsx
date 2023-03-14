

export const QuotationSchema = {
  name: "Quotation",
  properties: {
    _id: "int",
    quoteText: "string",
    author: "string",
    subjects: "string",
    authorLink: "string",
    videoLink: "string",
    contributedBy: "string?",
    favorite: "int",
  },
  primaryKey: "_id",
};

export const SubjectV1Schema = {
  name: "SubjectV1",
  properties: {
    _id: "int",
    value: "string",
  },
};

export const AuthorSchema = {
  name: "Author",
  properties: {
    _id: "int",
    subject: "string",
  },
};

