const express = require("express");
const {
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
} = require("../controllers/documentController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.post("/verify", upload.single("file"), verifyDocument);
router.post("/verify-selective", verifySelectiveProof);
router.get("/blockchain/status", getBlockchainStatus);
router.post("/:docId/versions", upload.single("file"), uploadNewVersion);
router.get("/:docId", getDocumentDetails);
router.get("/:docId/versions", getVersionHistory);
router.post("/:docId/revoke", revokeDocument);
router.post("/:docId/proof", generateProof);
router.post("/:docId/historical-verify", verifyHistoricalStatus);
router.get("/:docId/audit", getDocumentAuditLogs);

module.exports = router;
