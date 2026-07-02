const documents = [];
const versions = [];
const revocations = [];

let nextId = 1;

const createRecord = (data) => {
  const record = {
    _id: `mock-id-${nextId++}`,
    ...data
  };

  record.save = jest.fn(async () => record);
  return record;
};

const sortRecords = (records, sortBy) => {
  const [[field, direction]] = Object.entries(sortBy);

  return [...records].sort((left, right) => {
    if (left[field] === right[field]) {
      return 0;
    }

    return left[field] > right[field] ? direction : -direction;
  });
};

const Document = {
  create: jest.fn(async (data) => {
    const document = createRecord(data);
    documents.push(document);
    return document;
  }),

  findOne: jest.fn(async (query) => {
    return documents.find((document) => document.docId === query.docId) || null;
  })
};

const Version = {
  create: jest.fn(async (data) => {
    const version = createRecord(data);
    versions.push(version);
    return version;
  }),

  find: jest.fn((query) => ({
    sort: jest.fn(async (sortBy) => {
      return sortRecords(
        versions.filter((version) => version.docId === query.docId),
        sortBy
      );
    })
  })),

  findOne: jest.fn((query) => {
    if (query.hash) {
      return Promise.resolve(versions.find((version) => version.hash === query.hash) || null);
    }

    return {
      sort: jest.fn(async (sortBy) => {
        const matchingVersions = versions.filter((version) => version.docId === query.docId);
        return sortRecords(matchingVersions, sortBy)[0] || null;
      })
    };
  }),

  findById: jest.fn(async (id) => {
    return versions.find((version) => version._id === id) || null;
  })
};

const Revocation = {
  create: jest.fn(async (data) => {
    const revocation = createRecord(data);
    revocations.push(revocation);
    return revocation;
  }),

  findOne: jest.fn((query) => ({
    sort: jest.fn(async (sortBy) => {
      const matchingRevocations = revocations.filter((revocation) => revocation.docId === query.docId);
      return sortRecords(matchingRevocations, sortBy)[0] || null;
    })
  }))
};

const resetMockDatabase = () => {
  documents.length = 0;
  versions.length = 0;
  revocations.length = 0;
  nextId = 1;
};

module.exports = {
  Document,
  Version,
  Revocation,
  documents,
  versions,
  revocations,
  resetMockDatabase
};
