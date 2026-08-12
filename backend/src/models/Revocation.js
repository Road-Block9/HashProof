const mongoose = require("mongoose");

const revocationSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true
    },
    docId: {
      type: String,
      required: true,
      trim: true
    },
    version: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
      required: false // Optional for backward compatibility with global revocations
    },
    versionNumber: {
      type: Number,
      required: false
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    revokedBy: {
      type: String,
      required: true,
      trim: true
    },
    revokedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    blockchainTxHash: {
      type: String,
      default: null
    },
    blockchainStatus: {
      type: String,
      enum: ["PENDING", "STORED", "FAILED", "NOT_CONFIGURED"],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

revocationSchema.index({ docId: 1 });
revocationSchema.index({ docId: 1, versionNumber: 1 });

module.exports = mongoose.model("Revocation", revocationSchema);
