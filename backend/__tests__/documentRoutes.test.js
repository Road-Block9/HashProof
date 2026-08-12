const fs = require("fs/promises");
const path = require("path");
const request = require("supertest");

jest.mock("../src/models/Document", () => require("../test-utils/mockDatabase").Document);
jest.mock("../src/models/Version", () => require("../test-utils/mockDatabase").Version);
jest.mock("../src/models/Revocation", () => require("../test-utils/mockDatabase").Revocation);
jest.mock("../src/models/AuditLog", () => require("../test-utils/mockDatabase").AuditLog);

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
  revokeDocumentVersion: jest.fn(async () => ({
    success: true,
    status: "STORED",
    txHash: "0xmock-version-revoke"
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
  })),
  getDocumentMerkleRoot: jest.fn(async () => ({
    success: true,
    merkleRoot: "0xmock-merkle-root"
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
    documentType: "Certificate",
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
    expect(response.body.message).toBe("Document version revoked successfully");
    // Ensure the revokedVersion matches
    expect(response.body.data.revokedVersion.lifecycleState).toBe("Revoked");
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

  test("blocks or detects uploading the same file again as a duplicate", async () => {
    await uploadDocument();

    const response = await uploadDocument({
      title: "Duplicate Certificate"
    });

    expect([400, 409]).toContain(response.statusCode);
    expect(response.body.success).toBe(false);
    expect(response.body.message.toLowerCase()).toMatch(/duplicate|already|exists/);
  });

  describe("Metadata Validation", () => {
    test("rejects upload with missing required fields", async () => {
      const response = await uploadDocument({ title: "" });
      
      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain("Title is required");
    });

    test("rejects upload with invalid email format", async () => {
      const response = await uploadDocument({ ownerEmail: "invalid-email" });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain("Owner Email is invalid");
    });

    test("rejects upload with unsupported document type", async () => {
      const response = await uploadDocument({ documentType: "InvalidType" });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("Document Type must be one of")])
      );
    });

    test("enforces owner consistency when uploading new version", async () => {
      const uploadResponse = await uploadDocument();
      const docId = uploadResponse.body.data.document.docId;

      const newVersionResponse = await request(app)
        .post(`/api/documents/${docId}/versions`)
        .field("ownerName", "Different Owner")
        .attach("file", pdfBuffer, {
          filename: "certificate_v2.pdf",
          contentType: "application/pdf"
        });

      expect(newVersionResponse.statusCode).toBe(400);
      expect(newVersionResponse.body.success).toBe(false);
      expect(newVersionResponse.body.errors).toContain("Owner Name cannot be changed in a new version");
    });
  });

  describe("Historical Verification", () => {
    test("verifies a document correctly in the past and handles revocation", async () => {
      const uploadResponse = await uploadDocument();
      const docId = uploadResponse.body.data.document.docId;
      
      const beforeRevocationDate = new Date().toISOString();
      
      // Delay to ensure revocation happens after the "before" date
      await new Promise(resolve => setTimeout(resolve, 50));
      
      await revokeDocument(docId);
      
      const afterRevocationDate = new Date().toISOString();

      // Test valid historically
      const validHistoricalResponse = await request(app)
        .post(`/api/documents/${docId}/historical-verify`)
        .send({ targetDate: beforeRevocationDate });

      if (!validHistoricalResponse.body.data.isValid) {
        console.log(validHistoricalResponse.body.data);
      }

      expect(validHistoricalResponse.statusCode).toBe(200);
      expect(validHistoricalResponse.body.success).toBe(true);
      expect(validHistoricalResponse.body.data.isValid).toBe(true);
      expect(validHistoricalResponse.body.data.lifecycleState).toBe("Issued");

      // Test invalid historically
      const invalidHistoricalResponse = await request(app)
        .post(`/api/documents/${docId}/historical-verify`)
        .send({ targetDate: afterRevocationDate });

      expect(invalidHistoricalResponse.statusCode).toBe(200);
      expect(invalidHistoricalResponse.body.success).toBe(true);
      expect(invalidHistoricalResponse.body.data.isValid).toBe(false);
      expect(invalidHistoricalResponse.body.data.lifecycleState).toMatch(/Revoked/);
    });

    test("returns not yet issued for past dates", async () => {
      const uploadResponse = await uploadDocument();
      const docId = uploadResponse.body.data.document.docId;

      const pastDate = new Date(Date.now() - 100000).toISOString();

      const response = await request(app)
        .post(`/api/documents/${docId}/historical-verify`)
        .send({ targetDate: pastDate });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.isValid).toBe(false);
      expect(response.body.data.lifecycleState).toBe("Not Yet Issued");
    });
  });
});
