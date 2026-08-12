const AuditLog = require("../models/AuditLog");

/**
 * Logs an event in the Immutable Audit Log.
 * Does not throw errors so that it doesn't interrupt the main application flow.
 */
const logEvent = async ({
  docId,
  versionNumber,
  eventType,
  previousState,
  newState,
  performedBy = "System",
  blockchainTxHash,
  details
}) => {
  try {
    const log = await AuditLog.create({
      docId,
      versionNumber,
      eventType,
      previousState,
      newState,
      performedBy,
      blockchainTxHash,
      details
    });
    
    return log;
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
};

/**
 * Retrieves audit logs for a specific document, ordered chronologically.
 */
const getAuditLogs = async (docId, filters = {}) => {
  const query = { docId, ...filters };
  return await AuditLog.find(query).sort({ createdAt: 1 });
};

module.exports = {
  logEvent,
  getAuditLogs
};
