const Document = require("../models/Document");
const Version = require("../models/Version");
const Revocation = require("../models/Revocation");
const hashFile = require("../utils/hashFile");
const { transition } = require("../utils/stateMachine");
const blockchainService = require("../services/blockchainService");
const { storeUploadedPdf } = require("../services/fileStorageService");
const { validateNewDocument, validateNewVersion } = require("../utils/metadataValidator");
const { generateDocumentMerkleTree } = require("../utils/merkleUtils");
const auditService = require("../services/auditService");
const fs = require("fs/promises");

const generateDocId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DOC-${timestamp}-${random}`;
};

const buildFileMetadata = (file, storageResult) => ({
  fileName: file.originalname,
  filePath: storageResult.filePath,
  fileSize: file.size,
  mimeType: file.mimetype,
  storageProvider: storageResult.storageProvider,
  cloudinaryPublicId: storageResult.cloudinaryPublicId
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
    merkleRoot: version.merkleRoot,
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
    if (!req.file) {
      return sendResponse(res, 400, false, "PDF file is required");
    }

    const validation = validateNewDocument(req.body);

    if (!validation.isValid) {
      await deleteUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }

    const { title, description, issuerName, ownerName, ownerEmail, documentType } = validation.normalizedData;

    const docId = generateDocId();
    const fileHash = await hashFile(req.file.path);
    const existingVersion = await Version.findOne({ hash: fileHash });

    if (existingVersion) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 409, false, "Duplicate document: this file is already registered", {
        existingDocId: existingVersion.docId,
        existingVersionNumber: existingVersion.versionNumber
      });
    }

    const storageResult = await storeUploadedPdf(req.file);

    const document = await Document.create({
      docId,
      title,
      description,
      issuerName,
      ownerName,
      ownerEmail,
      documentType,
      currentVersion: 1,
      status: "ACTIVE"
    });

    const merkleTree = generateDocumentMerkleTree({
      title,
      description,
      issuerName,
      ownerName,
      ownerEmail,
      documentType,
      versionNumber: 1
    });
    const merkleRoot = merkleTree.getHexRoot();

    const version = await Version.create({
      document: document._id,
      docId,
      versionNumber: 1,
      ...buildFileMetadata(req.file, storageResult),
      hash: fileHash,
      merkleRoot,
      blockchainTxHash: null,
      blockchainStatus: "PENDING",
      lifecycleState: "Issued"
    });

    document.latestVersionId = version._id;
    await document.save();

    const blockchain = await syncVersionWithBlockchain(version);

    await auditService.logEvent({
      docId,
      versionNumber: 1,
      eventType: "Document Uploaded",
      previousState: null,
      newState: "Issued",
      performedBy: ownerName,
      blockchainTxHash: blockchain.txHash
    });

    return sendResponse(res, 201, true, "Document uploaded successfully", {
      document,
      version,
      blockchain,
      storage: {
        provider: storageResult.storageProvider,
        storageProvider: storageResult.storageProvider,
        filePath: storageResult.filePath,
        secureUrl: storageResult.secureUrl || null,
        cloudinaryPublicId: storageResult.cloudinaryPublicId,
        message: storageResult.storageMessage
      }
    });
  } catch (error) {
    next(error);
  }
};

const uploadNewVersion = async (req, res, next) => {
  try {
    const { docId } = req.params;

    if (!req.file) {
      return sendResponse(res, 400, false, "PDF file is required");
    }

    const document = await Document.findOne({ docId });

    if (!document) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 404, false, "Document not found");
    }

    const validation = validateNewVersion(req.body, document);

    if (!validation.isValid) {
      await deleteUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors
      });
    }

    const { title, description } = validation.normalizedData;

    const fileHash = await hashFile(req.file.path);
    const latestVersion = document.latestVersionId
      ? await Version.findById(document.latestVersionId)
      : await Version.findOne({ docId }).sort({ versionNumber: -1 });

    if (latestVersion && latestVersion.hash === fileHash) {
      await deleteUploadedFile(req.file);
      return sendResponse(res, 400, false, "New version file is identical to the latest version");
    }

    if (latestVersion) {
      try {
        const previousState = latestVersion.lifecycleState;
        transition(latestVersion, "Superseded");
        await latestVersion.save();
        await auditService.logEvent({
          docId,
          versionNumber: latestVersion.versionNumber,
          eventType: "Lifecycle Changed",
          previousState: previousState,
          newState: "Superseded",
          performedBy: document.ownerName
        });
      } catch (err) {
        console.error(`Transition to Superseded failed for version ${latestVersion.versionNumber}:`, err.message);
      }
    }

    const storageResult = await storeUploadedPdf(req.file);
    if (title) {
      document.title = title;
    }

    if (description !== undefined) {
      document.description = description;
    }

    const nextVersionNumber = document.currentVersion + 1;

    const merkleTree = generateDocumentMerkleTree({
      title: document.title,
      description: document.description,
      issuerName: document.issuerName,
      ownerName: document.ownerName,
      ownerEmail: document.ownerEmail,
      documentType: document.documentType,
      versionNumber: nextVersionNumber
    });
    const merkleRoot = merkleTree.getHexRoot();

    const version = await Version.create({
      document: document._id,
      docId,
      versionNumber: nextVersionNumber,
      ...buildFileMetadata(req.file, storageResult),
      hash: fileHash,
      merkleRoot,
      blockchainTxHash: null,
      blockchainStatus: "PENDING",
      lifecycleState: "Issued"
    });

    document.currentVersion = nextVersionNumber;
    document.latestVersionId = version._id;
    await document.save();

    const blockchain = await syncVersionWithBlockchain(version);

    await auditService.logEvent({
      docId,
      versionNumber: nextVersionNumber,
      eventType: "New Version Uploaded",
      previousState: null,
      newState: "Issued",
      performedBy: document.ownerName,
      blockchainTxHash: blockchain.txHash
    });

    return sendResponse(res, 201, true, "New document version uploaded successfully", {
      document,
      version,
      blockchain,
      storage: {
        provider: storageResult.storageProvider,
        storageProvider: storageResult.storageProvider,
        filePath: storageResult.filePath,
        secureUrl: storageResult.secureUrl || null,
        cloudinaryPublicId: storageResult.cloudinaryPublicId,
        message: storageResult.storageMessage
      }
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

    const versions = await Version.find({ docId }).sort({ versionNumber: -1 });
    const latestActiveVersion = versions.find(v => v.lifecycleState !== "Revoked") || null;
    
    const globalRevocation = document.status === "REVOKED" ? await Revocation.findOne({ docId, versionNumber: { $exists: false } }).sort({ revokedAt: -1 }) : null;
    const versionRevocations = await Revocation.find({ docId, versionNumber: { $exists: true } }).sort({ revokedAt: -1 });

    return sendResponse(res, 200, true, "Document details fetched successfully", {
      document,
      latestVersion: document.latestVersionId,
      latestActiveVersion,
      globalRevocation,
      versionRevocations
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
    const { reason, revokedBy, versionNumber } = req.body;

    if (!reason || !revokedBy) {
      return sendResponse(res, 400, false, "reason and revokedBy are required");
    }

    const document = await Document.findOne({ docId });

    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    const versions = await Version.find({ docId }).sort({ versionNumber: -1 });
    let targetVersion = null;

    if (versionNumber) {
      targetVersion = versions.find(v => v.versionNumber === Number(versionNumber));
      if (!targetVersion) {
        return sendResponse(res, 404, false, "Version not found");
      }
      if (targetVersion.lifecycleState === "Revoked") {
        return sendResponse(res, 400, false, "Version is already revoked");
      }
    } else {
      targetVersion = versions.find(v => v.lifecycleState !== "Revoked");
      if (!targetVersion) {
        return sendResponse(res, 400, false, "No active versions found to revoke");
      }
    }

    const revocation = await Revocation.create({
      document: document._id,
      docId,
      version: targetVersion._id,
      versionNumber: targetVersion.versionNumber,
      reason,
      revokedBy,
      revokedAt: new Date(),
      blockchainTxHash: null,
      blockchainStatus: "PENDING"
    });

    try {
      transition(targetVersion, "Revoked");
      await targetVersion.save();
    } catch (err) {
      console.error(`Transition to Revoked failed for version ${targetVersion.versionNumber}:`, err.message);
    }

    const blockchain = await blockchainService.revokeDocumentVersion({ 
      docId, 
      versionNumber: targetVersion.versionNumber,
      reason 
    });

    revocation.blockchainStatus = blockchain.status;

    if (blockchain.txHash) {
      revocation.blockchainTxHash = blockchain.txHash;
    }

    await revocation.save();

    await auditService.logEvent({
      docId,
      versionNumber: targetVersion.versionNumber,
      eventType: "Version Revoked",
      previousState: "Issued/Verified",
      newState: "Revoked",
      performedBy: revokedBy,
      blockchainTxHash: blockchain.txHash,
      details: { reason }
    });

    return sendResponse(res, 200, true, "Document version revoked successfully", {
      document,
      revocation,
      blockchain,
      revokedVersion: targetVersion
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
      
      const blockchainVerification = await blockchainService.verifyDocument({
        docId: matchedVersion.docId,
        fileHash: uploadedHash
      });
      
      const isLatestVersion = document && matchedVersion.versionNumber === document.currentVersion;
      const latestActiveVersion = versions.find(v => v.lifecycleState !== "Revoked");
      const newerActiveVersionAvailable = latestActiveVersion && latestActiveVersion.versionNumber > matchedVersion.versionNumber;
      
      const isVersionRevoked = matchedVersion.lifecycleState === "Revoked" || blockchainVerification.data?.isRevoked;
      const isGlobalRevoked = document?.status === "REVOKED";
      const isRevoked = isVersionRevoked || isGlobalRevoked;

      const revocation = isRevoked 
        ? await Revocation.findOne({ docId: matchedVersion.docId, $or: [{ versionNumber: matchedVersion.versionNumber }, { versionNumber: { $exists: false } }] }).sort({ revokedAt: -1 }) 
        : null;

      if (document && !isRevoked && matchedVersion.lifecycleState === "Issued") {
        try {
          transition(matchedVersion, "Verified");
          await matchedVersion.save();
        } catch (err) {
          console.error(`Transition to Verified failed for version ${matchedVersion.versionNumber}:`, err.message);
        }
      }

      return sendResponse(res, 200, true, "Registered document found", {
        status: isRevoked ? "REVOKED" : isLatestVersion ? "VALID_LATEST_VERSION" : "VALID_OLD_VERSION",
        isValid: !isRevoked,
        integrityChecked: true,
        matchedDocId: matchedVersion.docId,
        uploadedHash,
        matchedVersion,
        document,
        versions,
        revocation,
        blockchainVerification,
        newerActiveVersionAvailable,
        latestActiveVersion
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

    const latestActiveVersion = versions.find(v => v.lifecycleState !== "Revoked");
    const newerActiveVersionAvailable = latestActiveVersion && latestActiveVersion.versionNumber > matchedVersion.versionNumber;
    
    const isVersionRevoked = matchedVersion.lifecycleState === "Revoked" || blockchainVerification.data?.isRevoked;
    const isGlobalRevoked = document.status === "REVOKED";
    const isRevoked = isVersionRevoked || isGlobalRevoked;

    if (isRevoked) {
      const revocation = await Revocation.findOne({ docId, $or: [{ versionNumber: matchedVersion.versionNumber }, { versionNumber: { $exists: false } }] }).sort({ revokedAt: -1 });

      return sendResponse(res, 200, true, "Document version is revoked", {
        status: "REVOKED",
        isValid: false,
        integrityChecked: true,
        matchedVersion,
        revocation,
        blockchainVerification,
        newerActiveVersionAvailable,
        latestActiveVersion
      });
    }

    const isLatestVersion = matchedVersion.versionNumber === document.currentVersion;

    if (!isRevoked && matchedVersion.lifecycleState === "Issued") {
      try {
        transition(matchedVersion, "Verified");
        await matchedVersion.save();
      } catch (err) {
        console.error(`Transition to Verified failed for version ${matchedVersion.versionNumber}:`, err.message);
      }
    }

    return sendResponse(res, 200, true, "Document verified successfully", {
      status: isLatestVersion ? "VALID_LATEST_VERSION" : "VALID_OLD_VERSION",
      isValid: true,
      integrityChecked: true,
      matchedVersion,
      document,
      blockchainVerification,
      newerActiveVersionAvailable,
      latestActiveVersion
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

const generateProof = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { fieldsToDisclose, versionNumber } = req.body;

    if (!fieldsToDisclose || !Array.isArray(fieldsToDisclose) || fieldsToDisclose.length === 0) {
      return sendResponse(res, 400, false, "fieldsToDisclose must be a non-empty array of strings");
    }

    const document = await Document.findOne({ docId });

    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    const targetVersionNumber = versionNumber || document.currentVersion;
    const version = await Version.findOne({ docId, versionNumber: targetVersionNumber });

    if (!version) {
      return sendResponse(res, 404, false, "Version not found");
    }

    // Construct the metadata object for Merkle tree generation
    const metadata = {
      title: document.title,
      description: document.description,
      issuerName: document.issuerName,
      ownerName: document.ownerName,
      ownerEmail: document.ownerEmail,
      documentType: document.documentType,
      versionNumber: targetVersionNumber
    };

    const { generateSelectiveDisclosureProof } = require("../utils/merkleUtils");
    const { root, proofs } = generateSelectiveDisclosureProof(metadata, fieldsToDisclose);

    // Verify root matches
    if (root !== version.merkleRoot) {
      return sendResponse(res, 500, false, "Generated Merkle Root does not match stored root");
    }

    return sendResponse(res, 200, true, "Proof generated successfully", {
      docId,
      versionNumber: targetVersionNumber,
      root,
      proofs
    });
  } catch (error) {
    next(error);
  }
};

const verifySelectiveProof = async (req, res, next) => {
  try {
    const { docId, versionNumber, proofs } = req.body;

    if (!docId || !versionNumber || !proofs) {
      return sendResponse(res, 400, false, "docId, versionNumber, and proofs are required");
    }

    // Check document exists and revocation status
    const document = await Document.findOne({ docId });
    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    const version = await Version.findOne({ docId, versionNumber });
    if (!version) {
      return sendResponse(res, 404, false, "Version not found");
    }

    const blockchainRoot = version.merkleRoot;
    if (!blockchainRoot || blockchainRoot === "") {
      return sendResponse(res, 400, false, "Document version does not support selective verification (No Merkle Root)");
    }

    const { verifyFieldProof } = require("../utils/merkleUtils");

    const revealedFields = {};
    const failedFields = [];

    // Verify each proof
    for (const [field, proofData] of Object.entries(proofs)) {
      const isValid = verifyFieldProof(blockchainRoot, field, proofData.value, proofData.proof);
      if (isValid) {
        revealedFields[field] = proofData.value;
      } else {
        failedFields.push(field);
      }
    }

    const isFullyValid = failedFields.length === 0;

    // Check revocation status via blockchain verifyDocument
    const blockchainVerification = await blockchainService.verifyDocument({
      docId,
      fileHash: version.hash
    });
    
    const isGlobalRevoked = document.status === "REVOKED";
    const isVersionRevoked = version.lifecycleState === "Revoked" || blockchainVerification.data?.isRevoked;
    const isRevoked = isVersionRevoked || isGlobalRevoked;

    return sendResponse(res, 200, true, "Selective proof verification complete", {
      isValid: isFullyValid && !isRevoked,
      isRevoked,
      blockchainRoot,
      revealedFields: isFullyValid ? revealedFields : {},
      failedFields,
      message: isRevoked ? "Document is revoked" : (isFullyValid ? "Proof is valid" : "Proof contains invalid or tampered fields")
    });

  } catch (error) {
    next(error);
  }
};

const verifyHistoricalStatus = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const { versionNumber, targetDate } = req.body;

    if (!targetDate) {
      return sendResponse(res, 400, false, "targetDate is required");
    }

    const tDate = new Date(targetDate);
    if (isNaN(tDate.getTime())) {
      return sendResponse(res, 400, false, "Invalid targetDate format");
    }

    const document = await Document.findOne({ docId });
    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }

    const targetVersionNumber = versionNumber ? Number(versionNumber) : document.currentVersion;
    const version = await Version.findOne({ docId, versionNumber: targetVersionNumber });

    if (!version) {
      return sendResponse(res, 404, false, "Version not found");
    }

    // Fetch revocations
    const versionRevocation = await Revocation.findOne({ docId, versionNumber: targetVersionNumber }).sort({ revokedAt: 1 });
    const globalRevocation = await Revocation.findOne({ docId, versionNumber: { $exists: false } }).sort({ revokedAt: 1 });

    // Construct chronological timeline
    const timeline = [];
    
    // Issued (always first)
    timeline.push({ state: "Issued", timestamp: version.createdAt });

    if (version.verifiedAt) {
      timeline.push({ state: "Verified", timestamp: version.verifiedAt });
    }

    if (version.supersededAt) {
      timeline.push({ state: "Superseded", timestamp: version.supersededAt });
    }

    if (versionRevocation) {
      timeline.push({ 
        state: "Revoked", 
        timestamp: versionRevocation.revokedAt, 
        reason: versionRevocation.reason, 
        revokedBy: versionRevocation.revokedBy 
      });
    }

    if (globalRevocation) {
      timeline.push({ 
        state: "Revoked (Global)", 
        timestamp: globalRevocation.revokedAt, 
        reason: globalRevocation.reason, 
        revokedBy: globalRevocation.revokedBy,
        isGlobal: true
      });
    }

    // Sort timeline ascending by timestamp
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Determine state at targetDate
    let stateAtTarget = "Not Yet Issued";
    let isValid = false;
    let revocationReason = null;

    if (tDate >= new Date(version.createdAt)) {
      // Find the last event that occurred on or before targetDate
      const pastEvents = timeline.filter(event => new Date(event.timestamp) <= tDate);
      
      if (pastEvents.length > 0) {
        // If there's a Revoked event anywhere in the pastEvents, it overrides anything else
        // because once revoked, it stays revoked.
        const revokedEvent = pastEvents.find(e => e.state.startsWith("Revoked"));
        if (revokedEvent) {
          stateAtTarget = revokedEvent.state;
          isValid = false;
          revocationReason = revokedEvent.reason;
        } else {
          const lastEvent = pastEvents[pastEvents.length - 1];
          stateAtTarget = lastEvent.state;
          isValid = ["Issued", "Verified"].includes(stateAtTarget);
        }
      }
    }

    return sendResponse(res, 200, true, "Historical verification complete", {
      docId,
      versionNumber: targetVersionNumber,
      targetDate: tDate,
      isValid,
      lifecycleState: stateAtTarget,
      revocationReason,
      timeline
    });

  } catch (error) {
    next(error);
  }
};

const getDocumentAuditLogs = async (req, res, next) => {
  try {
    const { docId } = req.params;
    const document = await Document.findOne({ docId });
    if (!document) {
      return sendResponse(res, 404, false, "Document not found");
    }
    const logs = await auditService.getAuditLogs(docId);
    return sendResponse(res, 200, true, "Audit logs fetched successfully", { document, logs });
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
  getBlockchainStatus,
  generateProof,
  verifySelectiveProof,
  verifyHistoricalStatus,
  getDocumentAuditLogs
};
