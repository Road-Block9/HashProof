const express = require("express");
const {
  uploadDocument,
  uploadNewVersion,
  getDocumentDetails,
  getVersionHistory,
  revokeDocument,
  verifyDocument
} = require("../controllers/documentController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.post("/verify", upload.single("file"), verifyDocument);
router.post("/:docId/versions", upload.single("file"), uploadNewVersion);
router.get("/:docId", getDocumentDetails);
router.get("/:docId/versions", getVersionHistory);
router.post("/:docId/revoke", revokeDocument);

module.exports = router;
