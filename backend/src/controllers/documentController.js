const Document = require("../models/Document");
const Version = require("../models/Version");
const Revocation = require("../models/Revocation");
const hashFile = require("../utils/hashFile");
const blockchainService = require("../services/blockchainService");
const fs = require("fs/promises");

const generateDocId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DOC-${timestamp}-${random}`;
};

const buildFileMetadata = (file) => ({
  fileName: file.originalname,
  filePath: file.path,
  fileSize: file.size,
  mimeType: file.mimetype
});

const sendResponse = (res, statusCode, success, message, data = {}) => {
  return res.status(statusCode).json({ success, message, data });
};

const deleteUploadedFile = async (file) => {
  if (!file || !file.path) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.error("Failed to delete uploaded file:", error.message);
  }
};

const syncVersionWithBlockchain = async (version) => {
  const blockchainResult = await blockchainService.registerDocumentVersion({
    docId: version.docId,
    fileHash: version.hash,
    versionNumber: version.versionNumber
  });

  version.blockchainStatus = blockchainResult.status;

  if (blockchainResult.txHash) {
    version.blockchainTxHash = blockchainResult.txHash;
  }

  await version.save();
  return blockchainResult;
};

const uploadDocument = async (req, res, next) => {
  try {
    const { title, description, issuerName, ownerName, ownerEmail } = req.body;

    if (!req.file) {
      return sendResponse(res, 400, false, "PDF file is required");
    }

    if (!title || !issuerName || !ownerName || !ownerEmail) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 400, false, "title, issuerName, ownerName, and ownerEmail are required");
    }

    const docId = generateDocId();
    const fileHash = await hashFile(req.file.path);
    const existingVersion = await Version.findOne({ hash: fileHash }).select("docId versionNumber");

    if (existingVersion) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 409, false, "Duplicate document: this file is already registered", {
        existingDocId: existingVersion.docId,
        existingVersionNumber: existingVersion.versionNumber
      });
    }

    const document = await Document.create({
      docId,
      title,
      description,
      issuerName,
      ownerName,
      ownerEmail,
      currentVersion: 1,
      status: "ACTIVE"
    });

    const version = await Version.create({
      document: document._id,
      docId,
      versionNumber: 1,
      ...buildFileMetadata(req.file),
      hash: fileHash,
      blockchainTxHash: null,
      blockchainStatus: "PENDING"
    });

    document.latestVersionId = version._id;
    await document.save();

    const blockchain = await syncVersionWithBlockchain(version);

    return sendResponse(res, 201, true, "Document uploaded successfully", {
      document,
      version,
      blockchain
    });
  } catch (error) {
    next(error);
  }
};

const uploadNewVersion = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { title, description } = req.body;

    if (!req.file) {
      return sendResponse(res, 400, false, "PDF file is required");
    }

    const document = await Document.findOne({ docId });

    if (!document) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 404, false, "Document not found");
    }

    if (document.status === "REVOKED") {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 400, false, "Cannot upload a new version for a revoked document");
    }

    const fileHash = await hashFile(req.file.path);
    const latestVersion = document.latestVersionId
      ? await Version.findById(document.latestVersionId)
      : await Version.findOne({ docId }).sort({ versionNumber: -1 });

    if (latestVersion && latestVersion.hash === fileHash) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 400, false, "New version file is identical to the latest version");
    }

    const nextVersionNumber = document.currentVersion + 1;

    const version = await Version.create({
      document: document._id,
      docId,
      versionNumber: nextVersionNumber,
      ...buildFileMetadata(req.file),
      hash: fileHash,
      blockchainTxHash: null,
      blockchainStatus: "PENDING"
    });

    if (title) {
      document.title = title;
    }

    if (description !== undefined) {
      document.description = description;
    }

    document.currentVersion = nextVersionNumber;
    document.latestVersionId = version._id;
    await document.save();

    const blockchain = await syncVersionWithBlockchain(version);

    return sendResponse(res, 201, true, "New document version uploaded successfully", {
      document,
      version,
      blockchain
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentDetails = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await Document.findOne({ docId }).populate("latestVersionId");

    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    const revocation =
      document.status === "REVOKED" ? await Revocation.findOne({ docId }).sort({ revokedAt: -1 }) : null;

    return sendResponse(res, 200, true, "Document details fetched successfully", {
      document,
      latestVersion: document.latestVersionId,
      revocation
    });
  } catch (error) {
    next(error);
  }
};

const getVersionHistory = async (req, res, next) => {
  try {
    const { docId } = req.params;

    const document = await Document.findOne({ docId });

    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    const versions = await Version.find({ docId }).sort({ versionNumber: 1 });

    return sendResponse(res, 200, true, "Version history fetched successfully", { document, versions });
  } catch (error) {
    next(error);
  }
};

const revokeDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { reason, revokedBy } = req.body;

    if (!reason || !revokedBy) {
      return sendResponse(res, 400, false, "reason and revokedBy are required");
    }

    const document = await Document.findOne({ docId });

    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    if (document.status === "REVOKED") {
      const existingRevocation = await Revocation.findOne({ docId }).sort({ revokedAt: -1 });

      return sendResponse(res, 400, false, "Document is already revoked", {
        revocation: existingRevocation
      });
    }

    const revocation = await Revocation.create({
      document: document._id,
      docId,
      reason,
      revokedBy,
      revokedAt: new Date(),
      blockchainTxHash: null,
      blockchainStatus: "PENDING"
    });

    document.status = "REVOKED";
    await document.save();

    const blockchain = await blockchainService.revokeDocument({ docId, reason });

    revocation.blockchainStatus = blockchain.status;

    if (blockchain.txHash) {
      revocation.blockchainTxHash = blockchain.txHash;
    }

    await revocation.save();

    return sendResponse(res, 200, true, "Document revoked successfully", {
      document,
      revocation,
      blockchain
    });
  } catch (error) {
    next(error);
  }
};

const verifyDocument = async (req, res, next) => {
  try {
    const docId = req.body.docId?.trim();
    const hasFile = Boolean(req.file);

    if (!docId && !hasFile) {
      return sendResponse(res, 400, false, "Provide docId, PDF file, or both for verification");
    }

    let uploadedHash = null;

    if (hasFile) {
      uploadedHash = await hashFile(req.file.path);
      await deleteUploadedFile(req.file);
    }

    if (docId && !hasFile) {
      const document = await Document.findOne({ docId }).populate("latestVersionId");

      if (!document) {
        return sendResponse(res, 200, true, "Document ID not found", {
          status: "DOCUMENT_ID_NOT_FOUND",
          isValid: false,
          integrityChecked: false
        });
      }

      const versions = await Version.find({ docId }).sort({ versionNumber: 1 });
      const revocation =
        document.status === "REVOKED" ? await Revocation.findOne({ docId }).sort({ revokedAt: -1 }) : null;

      return sendResponse(res, 200, true, "Document record found, file integrity not checked", {
        status: document.status === "REVOKED" ? "RECORD_FOUND_REVOKED" : "RECORD_FOUND",
        isValid: false,
        integrityChecked: false,
        note: "Document record found, but file integrity was not checked because no PDF was uploaded.",
        document,
        latestVersion: document.latestVersionId,
        versions,
        revocation
      });
    }

    if (!docId && hasFile) {
      const matchedVersion = await Version.findOne({ hash: uploadedHash }).sort({ createdAt: -1 });

      if (!matchedVersion) {
        return sendResponse(res, 200, true, "Document not registered in this system.", {
          status: "NOT_REGISTERED",
          isValid: false,
          integrityChecked: true,
          uploadedHash
        });
      }

      const document = await Document.findOne({ docId: matchedVersion.docId });
      const versions = await Version.find({ docId: matchedVersion.docId }).sort({ versionNumber: 1 });
      const revocation =
        document?.status === "REVOKED" ? await Revocation.findOne({ docId: matchedVersion.docId }).sort({ revokedAt: -1 }) : null;
      const blockchainVerification = await blockchainService.verifyDocument({
        docId: matchedVersion.docId,
        fileHash: uploadedHash
      });
      const isLatestVersion = document && matchedVersion.versionNumber === document.currentVersion;

      return sendResponse(res, 200, true, "Registered document found", {
        status: document?.status === "REVOKED" ? "REVOKED" : isLatestVersion ? "VALID_LATEST_VERSION" : "VALID_OLD_VERSION",
        isValid: Boolean(document && document.status !== "REVOKED"),
        integrityChecked: true,
        matchedDocId: matchedVersion.docId,
        uploadedHash,
        matchedVersion,
        document,
        versions,
        revocation,
        blockchainVerification
      });
    }

    const document = await Document.findOne({ docId });
    const blockchainVerification = await blockchainService.verifyDocument({
      docId,
      fileHash: uploadedHash
    });

    if (!document) {
      return sendResponse(res, 200, true, "Document ID not found", {
        status: "INVALID_DOCUMENT_ID",
        isValid: false,
        integrityChecked: true,
        uploadedHash,
        blockchainVerification
      });
    }

    const versions = await Version.find({ docId }).sort({ versionNumber: 1 });
    const matchedVersion = versions.find((version) => version.hash === uploadedHash);

    if (!matchedVersion) {
      return sendResponse(res, 200, true, "File does not match registered document", {
        status: "TAMPERED_OR_UNKNOWN",
        isValid: false,
        integrityChecked: true,
        uploadedHash,
        blockchainVerification
      });
    }

    if (document.status === "REVOKED") {
      const revocation = await Revocation.findOne({ docId }).sort({ revokedAt: -1 });

      return sendResponse(res, 200, true, "Document is revoked", {
        status: "REVOKED",
        isValid: false,
        integrityChecked: true,
        matchedVersion,
        revocation,
        blockchainVerification
      });
    }

    const isLatestVersion = matchedVersion.versionNumber === document.currentVersion;

    return sendResponse(res, 200, true, "Document verified successfully", {
      status: isLatestVersion ? "VALID_LATEST_VERSION" : "VALID_OLD_VERSION",
      isValid: true,
      integrityChecked: true,
      matchedVersion,
      document,
      blockchainVerification
    });
  } catch (error) {
    await deleteUploadedFile(req.file);
    next(error);
  }
};

const getBlockchainStatus = async (req, res, next) => {
  try {
    const status = await blockchainService.getStatus();

    return sendResponse(res, 200, true, "Blockchain status fetched successfully", status);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  uploadNewVersion,
  getDocumentDetails,
  getVersionHistory,
  revokeDocument,
  verifyDocument,
  getBlockchainStatus
};
