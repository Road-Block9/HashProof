const fs = require("fs/promises");
const path = require("path");
const request = require("supertest");

jest.mock("../src/models/Document", () => require("../test-utils/mockDatabase").Document);
jest.mock("../src/models/Version", () => require("../test-utils/mockDatabase").Version);
jest.mock("../src/models/Revocation", () => require("../test-utils/mockDatabase").Revocation);

jest.mock("../src/services/blockchainService", () => ({
  registerDocumentVersion: jest.fn(async () => ({
    success: true,
    status: "STORED",
    txHash: "0xmock-register"
  })),
  revokeDocument: jest.fn(async () => ({
    success: true,
    status: "STORED",
    txHash: "0xmock-revoke"
  })),
  verifyDocument: jest.fn(async () => ({
    success: true,
    status: "AVAILABLE",
    data: {
      hashExists: true,
      matchedVersionNumber: 1,
      isRevoked: false,
      revocationReason: ""
    }
  })),
  getStatus: jest.fn(async () => ({
    configured: true,
    rpcReachable: true,
    contractConfigured: true
  }))
}));

const app = require("../src/app");
const { resetMockDatabase, versions } = require("../test-utils/mockDatabase");

const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF");

const uploadDocument = (overrides = {}) => {
  const fields = {
    title: "Test Certificate",
    description: "Certificate used in automated backend tests",
    issuerName: "Test University",
    ownerName: "Test Student",
    ownerEmail: "student@example.com",
    ...overrides
  };

  let uploadRequest = request(app)
    .post("/api/documents/upload")
    .attach("file", pdfBuffer, {
      filename: "certificate.pdf",
      contentType: "application/pdf"
    });

  Object.entries(fields).forEach(([key, value]) => {
    uploadRequest = uploadRequest.field(key, value);
  });

  return uploadRequest;
};

const verifyDocument = (docId) => {
  return request(app)
    .post("/api/documents/verify")
    .field("docId", docId)
    .attach("file", pdfBuffer, {
      filename: "certificate.pdf",
      contentType: "application/pdf"
    });
};

const revokeDocument = (docId) => {
  return request(app)
    .post(`/api/documents/${docId}/revoke`)
    .send({
      reason: "Certificate was cancelled",
      revokedBy: "Registrar"
    });
};

const cleanupUploadedFiles = async () => {
  await Promise.all(
    versions.map(async (version) => {
      if (!version.filePath) {
        return;
      }

      try {
        await fs.unlink(path.resolve(version.filePath));
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    })
  );
};

describe("Document API", () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  afterEach(async () => {
    await cleanupUploadedFiles();
  });

  test("uploads a document successfully", async () => {
    const response = await uploadDocument();

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document uploaded successfully");
    expect(response.body.data.document.docId).toMatch(/^DOC-/);
    expect(response.body.data.document.status).toBe("ACTIVE");
    expect(response.body.data.version.versionNumber).toBe(1);
    expect(response.body.data.version.hash).toHaveLength(64);
    expect(response.body.data.blockchain.status).toBe("STORED");
  });

  test("verifies an uploaded document successfully", async () => {
    const uploadResponse = await uploadDocument();
    const docId = uploadResponse.body.data.document.docId;

    const response = await verifyDocument(docId);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("VALID_LATEST_VERSION");
    expect(response.body.data.isValid).toBe(true);
    expect(response.body.data.matchedVersion.docId).toBe(docId);
  });

  test("revokes an uploaded document successfully", async () => {
    const uploadResponse = await uploadDocument();
    const docId = uploadResponse.body.data.document.docId;

    const response = await revokeDocument(docId);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Document revoked successfully");
    expect(response.body.data.document.status).toBe("REVOKED");
    expect(response.body.data.revocation.reason).toBe("Certificate was cancelled");
    expect(response.body.data.blockchain.status).toBe("STORED");
  });

  test("returns revoked status when verifying a revoked document", async () => {
    const uploadResponse = await uploadDocument();
    const docId = uploadResponse.body.data.document.docId;

    await revokeDocument(docId);
    const response = await verifyDocument(docId);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("REVOKED");
    expect(response.body.data.isValid).toBe(false);
    expect(response.body.data.revocation.reason).toBe("Certificate was cancelled");
  });

  test.failing("blocks or detects uploading the same file again as a duplicate", async () => {
    await uploadDocument();

    const response = await uploadDocument({
      title: "Duplicate Certificate"
    });

    expect([400, 409]).toContain(response.statusCode);
    expect(response.body.success).toBe(false);
    expect(response.body.message.toLowerCase()).toMatch(/duplicate|already|exists/);
  });
});
