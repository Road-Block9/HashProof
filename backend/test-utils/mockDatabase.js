const documents = [];
const versions = [];
const revocations = [];
const auditLogs = [];

let nextId = 1;

const createRecord = (data) => {
  const record = {
    _id: `mock-id-${nextId++}`,
    createdAt: new Date(),
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
    const document = createRecord({ createdAt: new Date(), ...data });
    documents.push(document);
    return document;
  }),

  findOne: jest.fn(async (query) => {
    return documents.find((document) => document.docId === query.docId) || null;
  })
};

const Version = {
  create: jest.fn(async (data) => {
    const version = createRecord({ createdAt: new Date(), ...data });
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
    let result = null;
    if (query.hash) {
      result = versions.find((version) => version.hash === query.hash) || null;
    } else if (query.versionNumber !== undefined) {
      result = versions.find((version) => version.docId === query.docId && version.versionNumber === query.versionNumber) || null;
    } else {
      result = versions.find((version) => version.docId === query.docId) || null;
    }

    const promise = Promise.resolve(result);
    
    promise.sort = jest.fn(async (sortBy) => {
      let matchingVersions = versions.filter((version) => version.docId === query.docId);
      if (query.versionNumber !== undefined) {
          matchingVersions = matchingVersions.filter(v => v.versionNumber === query.versionNumber);
      }
      return sortRecords(matchingVersions, sortBy)[0] || null;
    });

    return promise;
  }),

  findById: jest.fn(async (id) => {
    return versions.find((version) => version._id === id) || null;
  })
};

const Revocation = {
  create: jest.fn(async (data) => {
    const revocation = createRecord({ createdAt: new Date(), revokedAt: new Date(), ...data });
    revocations.push(revocation);
    return revocation;
  }),

  findOne: jest.fn((query) => {
    let result = null;
    let matchingRevocations = revocations.filter((revocation) => revocation.docId === query.docId);
    
    if (query.versionNumber && query.versionNumber.$exists === false) {
      matchingRevocations = matchingRevocations.filter((rev) => !rev.versionNumber);
    } else if (query.versionNumber !== undefined) {
      matchingRevocations = matchingRevocations.filter((rev) => rev.versionNumber === query.versionNumber);
    }

    const promise = Promise.resolve(matchingRevocations[0] || null);

    promise.sort = jest.fn(async (sortBy) => {
      return sortRecords(matchingRevocations, sortBy)[0] || null;
    });

    return promise;
  })
};

const AuditLog = {
  create: jest.fn(async (data) => {
    const log = createRecord({ createdAt: new Date(), ...data });
    auditLogs.push(log);
    return log;
  }),
  find: jest.fn((query) => ({
    sort: jest.fn(async (sortBy) => {
      const matchingLogs = auditLogs.filter((log) => log.docId === query.docId);
      return sortRecords(matchingLogs, sortBy);
    })
  }))
};

const resetMockDatabase = () => {
  documents.length = 0;
  versions.length = 0;
  revocations.length = 0;
  auditLogs.length = 0;
  nextId = 1;
};

module.exports = {
  Document,
  Version,
  Revocation,
  AuditLog,
  documents,
  versions,
  revocations,
  auditLogs,
  resetMockDatabase
};
